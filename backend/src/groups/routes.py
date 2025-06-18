from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete

from auth.tables import User
from database import database
from groups.tables import Invitations, Groups, UserGroups
from groups.utils import create_group, update_invite_status, check_success
from groups.schemas import GroupCreate, GroupResponse, InviteResponse, InviteStatus, InviteCreate
from auth.utils import get_current_user
from models.utils import DetailResponse

groups_router = APIRouter(prefix="/groups")


@groups_router.post("/", response_model=GroupResponse)
async def create_new_group(group: GroupCreate, current_user=Depends(get_current_user)):
    group_id = await create_group(group.name, current_user.id)
    return GroupResponse(id=group_id, name=group.name, creator_id=current_user.id)


async def enrich_groups_with_members(groups_list: list[dict]) -> list[GroupResponse]:
    if not groups_list:
        return []

    group_ids = [group["id"] for group in groups_list]

    # Получаем всех участников этих групп
    members_query = UserGroups.select().where(UserGroups.c.group_id.in_(group_ids))
    members = await database.fetch_all(members_query)

    # Словарь group_id -> список user_id
    members_map = defaultdict(list)
    for record in members:
        members_map[record["group_id"]].append(record["user_id"])

    # Формируем итоговый ответ
    return [
        GroupResponse(
            id=group["id"],
            name=group["name"],
            creator_id=group["creator_id"],
            members=members_map.get(group["id"], [])
        )
        for group in groups_list
    ]


@groups_router.get("/member/", response_model=list[GroupResponse])
async def get_user_groups(current_user=Depends(get_current_user)):
    """Получить все группы, в которых состоит пользователь"""
    query = select(Groups).join(UserGroups).where(UserGroups.c.user_id == current_user.id)
    groups_list = await database.fetch_all(query)
    return await enrich_groups_with_members([dict(row._mapping) for row in groups_list])


@groups_router.get("/creator/", response_model=list[GroupResponse])
async def get_created_groups(current_user=Depends(get_current_user)):
    """Получить все группы, созданные пользователем"""
    query = select(Groups).where(Groups.c.creator_id == current_user.id)
    groups_list = await database.fetch_all(query)
    return await enrich_groups_with_members([dict(row._mapping) for row in groups_list])


@groups_router.get("/all/", response_model=list[GroupResponse])
async def get_all_groups():
    """Получить все группы"""
    query = select(Groups)
    groups_list = await database.fetch_all(query)
    return await enrich_groups_with_members([dict(row._mapping) for row in groups_list])


@groups_router.delete("/{group_id}/remove-member/{user_id}", response_model=DetailResponse, responses={
    404: {"description": "Группа или пользователь не найдены"},
})
async def remove_user_from_group(
        group_id: int,
        user_id: int,
):
    """Удаление пользователя из группы (только создатель группы может удалять)"""

    # Проверка: состоит ли пользователь в группе
    link_query = select(UserGroups).where(
        (UserGroups.c.group_id == group_id) & (UserGroups.c.user_id == user_id)
    )
    link = await database.fetch_one(link_query)

    if not link:
        raise HTTPException(status_code=404, detail="Пользователь не состоит в этой группе")

    # Удаление
    delete_query = delete(UserGroups).where(
        (UserGroups.c.group_id == group_id) & (UserGroups.c.user_id == user_id)
    )
    await database.execute(delete_query)

    return {"detail": f"Пользователь {user_id} удалён из группы {group_id}"}


invites_router = APIRouter(prefix="/invites")


@invites_router.post("/", response_model=InviteResponse)
async def create_invite(invite: InviteCreate, current_user=Depends(get_current_user)):
    """Создать приглашение в группу"""
    if current_user.id == invite.recipient_id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")

    group_exists = await database.fetch_val(select(Groups.c.id).where(Groups.c.id == invite.group_id))
    if not group_exists:
        raise HTTPException(
            status_code=404,
            detail="Group not found."
        )
    # sender must be a member of the group
    sender_member = await database.fetch_one(
        select(UserGroups).where(
            UserGroups.c.group_id == invite.group_id,
            UserGroups.c.user_id == current_user.id
        )
    )

    sender_owner = await database.fetch_one(
        select(Groups).where(
            Groups.c.id == invite.group_id,
            Groups.c.creator_id == current_user.id
        )
    )
    if not (sender_member or sender_owner):
        raise HTTPException(status_code=403, detail="You must be a member of the group to send invites.")
    recipient_exists = await database.fetch_val(select(User.c.id).where(User.c.id == invite.recipient_id))
    if not recipient_exists:
        raise HTTPException(status_code=404, detail="Recipient user not found.")
    existing_invite = await database.fetch_one(
        select(Invitations).where(
            Invitations.c.group_id == invite.group_id,
            Invitations.c.recipient_id == invite.recipient_id,
            Invitations.c.status == InviteStatus.PENDING
        )
    )
    if existing_invite:
        raise HTTPException(status_code=409, detail="An active invite to this group for this recipient already exists.")
    already_member = await database.fetch_one(
        select(UserGroups).where(
            UserGroups.c.group_id == invite.group_id,
            UserGroups.c.user_id == invite.recipient_id
        )
    )
    group_owner = await database.fetch_one(
        select(Groups).where(
            Groups.c.id == invite.group_id,
            Groups.c.creator_id == invite.recipient_id
        )
    )

    if already_member or group_owner:
        raise HTTPException(status_code=400, detail="Recipient is already a member of this group.")

    insert_data = {
        "group_id": invite.group_id,
        "sender_id": current_user.id,
        "recipient_id": invite.recipient_id,
        "status": InviteStatus.PENDING
    }
    query = Invitations.insert().values(**insert_data)
    invite_id = await database.execute(query)
    created_invite = await database.fetch_one(select(Invitations).where(Invitations.c.id == invite_id))
    return InviteResponse(**created_invite._mapping)


@invites_router.get("/", response_model=list[InviteResponse])
async def list_incoming_invites(current_user=Depends(get_current_user)):
    """
    Получить все входящие инвайты для текущего пользователя
    """
    query = select(Invitations).where(Invitations.c.recipient_id == current_user.id,
                                      Invitations.c.status == InviteStatus.PENDING)
    invites = await database.fetch_all(query)
    return [InviteResponse(**invite._mapping) for invite in invites]


@invites_router.post("/{invite_id}/accept", response_model=InviteResponse)
async def accept_invite(invite_id: int, current_user=Depends(get_current_user)):
    """Принять приглашение в группу"""
    success = await update_invite_status(invite_id, InviteStatus.ACCEPTED, current_user.id)
    if not success:
        await check_success(invite_id, current_user.id)
    updated_invite = await database.fetch_one(select(Invitations).where(Invitations.c.id == invite_id))
    await database.execute(UserGroups.insert().values(
        user_id=current_user.id,
        group_id=updated_invite.group_id
    ))
    return updated_invite


@invites_router.post("/{invite_id}/decline", response_model=InviteResponse)
async def decline_invite(invite_id: int, current_user=Depends(get_current_user)):
    """Отклонить приглашение в группу"""
    success = await update_invite_status(invite_id, InviteStatus.DECLINED, current_user.id)
    if not success:
        await check_success(invite_id, current_user.id)
    updated_invite = await database.fetch_one(select(Invitations).where(Invitations.c.id == invite_id))
    return updated_invite

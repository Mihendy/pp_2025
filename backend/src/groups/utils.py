from fastapi import HTTPException
from sqlalchemy import select
from database import database
from groups.tables import Groups, UserGroups, Invitations
from groups.schemas import InviteStatus


async def create_group(name: str, creator_id: int):
    query = Groups.insert().values(name=name, creator_id=creator_id)
    return await database.execute(query)


async def add_user_to_group(user_id: int, group_id: int):
    query = UserGroups.insert().values(user_id=user_id, group_id=group_id)
    await database.execute(query)


async def remove_user_from_group(user_id: int, group_id: int):
    query = UserGroups.delete().where(
        (UserGroups.c.user_id == user_id) &
        (UserGroups.c.group_id == group_id)
    )
    await database.execute(query)


async def delete_group(group_id: int):
    query = Groups.delete().where(Groups.c.id == group_id)
    await database.execute(query)


async def create_invite(group_id: int, sender_id: int, recipient_id: int):
    query = Invitations.insert().values(
        group_id=group_id,
        sender_id=sender_id,
        recipient_id=recipient_id
    )
    return await database.execute(query)


async def update_invite_status(invite_id: int, new_status: InviteStatus, recipient_id: int):
    if not isinstance(new_status, InviteStatus):
        raise ValueError("new_status must be an instance of InviteStatus Enum.")

    check_query = Invitations.select().where(
        Invitations.c.id == invite_id,
        Invitations.c.status == new_status,
        Invitations.c.recipient_id == recipient_id
    )
    updated_invite = await database.fetch_one(check_query)
    if updated_invite:
        return False

    query = Invitations.update().where(
        Invitations.c.id == invite_id,
        Invitations.c.status == InviteStatus.PENDING,
        Invitations.c.recipient_id == recipient_id
    ).values(status=new_status.value)
    await database.execute(query)

    updated_invite = await database.fetch_one(check_query)
    return updated_invite is not None

async def is_user_in_group(user_id: int, group_id: int):
    query = select(UserGroups).where(
        (UserGroups.c.user_id == user_id) &
        (UserGroups.c.group_id == group_id)
    )
    return await database.fetch_one(query) is not None


async def check_success(invite_id: int, current_user_id: int):
    existing_invite = await database.fetch_one(
        select(Invitations).where(Invitations.c.id == invite_id)
    )
    if not existing_invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    if existing_invite.recipient_id != current_user_id:
        raise HTTPException(status_code=403, detail="You are not the recipient of this invite")
    if existing_invite.status != InviteStatus.PENDING:
        raise HTTPException(status_code=409, detail=f"Invite status is '{existing_invite.status}', cannot change.")
    raise HTTPException(status_code=500, detail="Failed to update invite status due to an unexpected error.")

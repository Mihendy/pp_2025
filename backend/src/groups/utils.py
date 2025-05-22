from sqlalchemy import insert, select, delete
from database import database
from groups.models import groups, user_groups, invitations

async def create_group(name: str, creator_id: int):
    query = groups.insert().values(name=name, creator_id=creator_id)
    return await database.execute(query)

async def add_user_to_group(user_id: int, group_id: int):
    query = user_groups.insert().values(user_id=user_id, group_id=group_id)
    await database.execute(query)

async def remove_user_from_group(user_id: int, group_id: int):
    query = user_groups.delete().where(
        (user_groups.c.user_id == user_id) &
        (user_groups.c.group_id == group_id)
    )
    await database.execute(query)

async def delete_group(group_id: int):
    query = groups.delete().where(groups.c.id == group_id)
    await database.execute(query)

async def create_invite(group_id: int, sender_id: int, recipient_id: int):
    query = invitations.insert().values(
        group_id=group_id,
        sender_id=sender_id,
        recipient_id=recipient_id
    )
    return await database.execute(query)

async def update_invite_status(invite_id: int, status: str):
    query = invitations.update().where(
        invitations.c.id == invite_id
    ).values(status=status)
    await database.execute(query)

async def is_user_in_group(user_id: int, group_id: int):
    query = select(user_groups).where(
        (user_groups.c.user_id == user_id) &
        (user_groups.c.group_id == group_id)
    )
    return await database.fetch_one(query) is not None
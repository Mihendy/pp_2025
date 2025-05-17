from database import database
from tables import file_permissions


async def add_permission(file_path: str, user_id: int, rights_type: str):
    query = file_permissions.insert().values(
        file_path=file_path,
        user_id=user_id,
        rights_type=rights_type
    )
    return await database.execute(query)


async def remote_permission(file_path: str, user_id: int):
    query = file_permissions.delete().where(
        (file_permissions.c.file_path == file_path) &
        (file_permissions.c.user_id == user_id)
    )
    result = await database.execute(query)
    return result > 0


async def check_file_access(file_path: str, user_id: int, required_right: str):
    query = file_permissions.select().where(
        (file_permissions.c.file_path == file_path) &
        (file_permissions.c.user_id == user_id)
    )
    perm = await database.fetch_one(query)

    if not perm:
        return False
    if perm.rights_type == 'owner':
        return True
    if perm.rights_type == 'editor' and required_right in ['editor', 'viewer']:
        return True
    if perm.rights_type == 'viewer' and required_right == 'viewer':
        return True
    return False
from database import database
from file_permission.schemas import RIGHT_TYPES
from file_permission.tables import FilePermissions


async def add_permission(file_path: str, user_id: int, rights_type: str):
    query = FilePermissions.insert().values(
        file_path=file_path,
        user_id=user_id,
        rights_type=rights_type
    )
    return await database.execute(query)


async def revoke_permission(file_path: str, user_id: int):
    query = FilePermissions.delete().where(
        (FilePermissions.c.file_path == file_path) &
        (FilePermissions.c.user_id == user_id)
    )
    result = await database.execute(query)
    return result > 0


async def check_file_access(file_path: str, user_id: int, required_right: str):
    query = FilePermissions.select().where(
        (FilePermissions.c.file_path == file_path) &
        (FilePermissions.c.user_id == user_id)
    )
    perm = await database.fetch_one(query)

    if not perm:
        return False
    if perm.rights_type == RIGHT_TYPES.OWNER:
        return True
    if perm.rights_type == RIGHT_TYPES.EDITOR and required_right in [RIGHT_TYPES.EDITOR, RIGHT_TYPES.VIEWER]:
        return True
    if perm.rights_type == RIGHT_TYPES.VIEWER and required_right == RIGHT_TYPES.VIEWER:
        return True
    return False

async def get_file_owner_id(file_path: str):
    query = FilePermissions.select().where(
        (FilePermissions.c.file_path == file_path) &
        (FilePermissions.c.rights_type == RIGHT_TYPES.OWNER)
    )
    return (await database.fetch_one(query)).user_id
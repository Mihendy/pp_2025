from sqlalchemy import select

from database import database
from file_permission.tables import FilePermissions


async def get_user_file_paths(user_id):
    query = select(FilePermissions.c.file_path).where(FilePermissions.c.user_id == user_id)
    rows = await database.fetch_all(query)
    # Возвращаем список строк (пути к файлам)
    return [row['file_path'] for row in rows]

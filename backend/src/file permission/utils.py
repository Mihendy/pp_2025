from schemas import FilePermission, RIGHT_TYPES, file_permissions_db


def add_permission(file_path: str, user_id: int, rights_type: RIGHT_TYPES) -> FilePermission:
    for perm in file_permissions_db:
        if perm.file_path == file_path and perm.user_id == user_id:
            raise ValueError("Доступ уже есть")

    new_id = len(file_permissions_db) + 1
    new_perm = FilePermission(
        id=new_id,
        rights_type=rights_type,
        file_path=file_path,
        user_id=user_id,
    )
    file_permissions_db.append(new_perm)
    return new_perm

def remote_permission(file_path: str, user_id: int) -> bool:
    global  file_permissions_db
    new_permissions = [
        perm for perm in file_permissions_db
        if not (perm.file_path == file_path and perm.user_id == user_id)
    ]
    if len(new_permissions) != len(file_permissions_db):
        file_permissions_db = new_permissions
        return True
    return False

def check_file_access(file_path: str, user_id: int, required_right: RIGHT_TYPES) -> bool:
    for perm in file_permissions_db:
        if perm.file_path == file_path and perm.user_id == user_id:
            if perm.rights_type == RIGHT_TYPES.OWNER:
                return True
            elif perm.rights_type == RIGHT_TYPES.EDITOR and required_right in [RIGHT_TYPES.EDITOR, RIGHT_TYPES.VIEWER]:
                return True
            elif perm.rights_type == RIGHT_TYPES.VIEWER and required_right == RIGHT_TYPES.VIEWER:
                return True
    return False
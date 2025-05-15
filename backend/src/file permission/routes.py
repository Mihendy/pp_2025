from fastapi import APIRouter, Depends, HTTPException
from utils import add_permission, remote_permission, check_file_access
from schemas import RIGHT_TYPES
from auth.utils import get_current_user
from auth.tables import User
router = APIRouter(prefix="/rights")

@router.post("/")
async def grant_permission_api(
    file_path: str,
    user_id: int,
    rights_type: RIGHT_TYPES,
    current_user: User = Depends(get_current_user),
):
    if not check_file_access(file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может выдавать права")

    try:
        new_perm = add_permission(file_path, user_id, rights_type)
        return {"status": "ok", "permission": new_perm}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.delete("/{file_path}/{user_id}")
async def revoke_permission_api(
    file_path: str,
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    if not check_file_access(file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может отзывать права")

    success = remote_permission(file_path, user_id)
    if not success:
        raise HTTPException(404, detail="Право не найдено")
    return {"status": "ok"}

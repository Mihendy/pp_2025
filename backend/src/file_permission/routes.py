from fastapi import APIRouter, Depends, HTTPException
from auth.utils import get_current_user
from auth.tables import User
from file_permission.utils import add_permission, revoke_permission, check_file_access
from file_permission.schemas import RIGHT_TYPES

router = APIRouter(prefix="/rights")

@router.post("/")
async def grant_permission_api(
    file_path: str,
    user_id: int,
    rights_type: RIGHT_TYPES,
    current_user: User = Depends(get_current_user),
):
    if not await check_file_access(file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может выдавать права")

    try:
        perm_id = await add_permission(file_path, user_id, rights_type)
        return {"status": "ok", "permission_id": perm_id}
    except Exception as e:
        raise HTTPException(400, detail=str(e))

@router.delete("/{file_path}/{user_id}")
async def revoke_permission_api(
    file_path: str,
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    if not await check_file_access(file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может отзывать права")

    success = await revoke_permission(file_path, user_id)
    if not success:
        raise HTTPException(404, detail="Право не найдено")
    return {"status": "ok"}
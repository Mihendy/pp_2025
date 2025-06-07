from fastapi import APIRouter, Depends, HTTPException
from auth.utils import get_current_user
from auth.tables import User
from file_permission.utils import add_permission, revoke_permission, check_file_access
from file_permission.schemas import RIGHT_TYPES, FilePermissionGrant
from models.utils import DetailResponse

router = APIRouter(prefix="/rights")


@router.post("/", response_model=DetailResponse, responses={
    403: {"description": "Только владелец может выдавать права"},
    404: {"description": "Файл не найден"},
})
async def grant_file_permission(
        fp: FilePermissionGrant,
        current_user: User = Depends(get_current_user),
):
    if not await check_file_access(fp.file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может выдавать права")

    try:
        perm_id = await add_permission(fp.file_path, fp.user_id, fp.rights_type)
        return {"detail": "Permission granted successfully"}
    except Exception as e:
        raise HTTPException(400, detail=str(e))


@router.delete("/{file_path}/{user_id}", response_model=DetailResponse, responses={
    403: {"description": "Только владелец может отзывать права"},
    404: {"description": "Право не найдено"},
})
async def revoke_file_permission(
        file_path: str,
        user_id: int,
        current_user: User = Depends(get_current_user),
):
    if not await check_file_access(file_path, current_user.id, RIGHT_TYPES.OWNER):
        raise HTTPException(403, detail="Только владелец может отзывать права")

    success = await revoke_permission(file_path, user_id)
    if not success:
        raise HTTPException(404, detail="Право не найдено")
    return {"detail": "Permission revoked successfully"}

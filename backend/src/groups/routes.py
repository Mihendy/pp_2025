from fastapi import APIRouter, Depends, HTTPException
from groups.utils import create_group, delete_group, create_invite, update_invite_status
from groups.schemas import GroupCreate, GroupResponse, InviteResponse, InviteStatus
from auth.utils import get_current_user
router = APIRouter(prefix="/groups")

@router.post("/", response_model=GroupResponse)
async def create_new_group(
    group: GroupCreate,
    current_user = Depends(get_current_user)
):
    group_id = await create_group(group.name, current_user.id)
    return {"id": group_id, "name": group.name, "creator_id": current_user.id}

router = APIRouter(prefix="/invites")

@router.post("/{invite_id}/accept", response_model=InviteResponse)
async def accept_invite(
    invite_id: int,
    current_user = Depends(get_current_user)
):
    await update_invite_status(invite_id, InviteStatus.ACCEPTED)
    return {"status": "accepted"}
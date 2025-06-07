from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class GroupCreate(BaseModel):
    name: str

class GroupResponse(BaseModel):
    id: int
    name: str
    creator_id: int

class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class InviteResponse(BaseModel):
    id: int
    group_id: int
    sender_id: int
    recipient_id: int
    status: InviteStatus
    created_at: datetime
    updated_at: datetime

class InviteCreate(BaseModel):
    group_id: int
    recipient_id: int

class InviteUpdate(BaseModel):
    id: int
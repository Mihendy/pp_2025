from pydantic import BaseModel
from typing import List
from enum import Enum


class RIGHT_TYPES(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"


class FilePermission(BaseModel):
    id: int
    rights_type: RIGHT_TYPES
    file_path: str
    user_id: str


class FilePermissionGrant(BaseModel):
    file_path: str
    user_id: int
    rights_type: RIGHT_TYPES

class FilePermissionRevoke(BaseModel):
    file_path: str
    user_id: int
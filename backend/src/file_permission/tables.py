from database import metadata
from sqlalchemy import Column, Integer, String, Table,  Enum, ForeignKey
from enum import Enum as PyEnum

class RightsType(str, PyEnum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"

FilePermissions = Table(
    "file_permissions",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("file_path", String, index=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("rights_type", Enum(RightsType)),
)
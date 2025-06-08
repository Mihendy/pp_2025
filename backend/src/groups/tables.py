from sqlalchemy import Table, Column, Integer, String, ForeignKey
from database import metadata
from groups.schemas import InviteStatus
from models.utils import timestamp_columns

Groups = Table(
    "groups",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, nullable=False),
    Column("creator_id", Integer, ForeignKey("users.id"), nullable=False)
)

UserGroups = Table(
    "user_groups",
    metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True)
)

Invitations = Table(
    "invitations",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), nullable=False),
    Column("sender_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("recipient_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("status", String, default=InviteStatus.PENDING, nullable=False),
    *timestamp_columns(),
)

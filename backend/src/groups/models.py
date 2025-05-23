from sqlalchemy import Table, Column, Integer, String, ForeignKey, DateTime
from database import metadata
from sqlalchemy.sql import func

groups = Table(
    "groups",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, nullable=False),
    Column("creator_id", Integer, ForeignKey("users.id"), nullable=False)
)

user_groups = Table(
    "user_groups",
    metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True)
)


invitations = Table(
    "invitations",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), nullable=False),
    Column("sender_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("recipient_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("status", String, default="pending", nullable=False),
    Column("created_at", DateTime, server_default=func.now())
)
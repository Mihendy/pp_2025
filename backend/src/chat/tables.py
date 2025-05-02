from database import metadata
from models.utils import timestamp_columns
from sqlalchemy import Column, ForeignKey, Integer, String, Table

Message = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("chat_id", Integer, ForeignKey("chats.id"), nullable=False),
    Column("sender_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("text", String, nullable=False),
    *timestamp_columns(),
)

Chat = Table(
    "chats",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("owner_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("name", String, nullable=False),
    Column("description", String, nullable=True),
    *timestamp_columns(),
)

ChatMember = Table(
    "chat_members",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("chat_id", Integer, ForeignKey("chats.id"), nullable=False),
    Column("user_id", Integer, ForeignKey("users.id"), nullable=False),
)

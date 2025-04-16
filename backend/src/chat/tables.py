from database import metadata
from sqlalchemy import (Column, DateTime, ForeignKey, Integer, String, Table,
                        func)

Message = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("sender_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("text", String, nullable=False),
    Column("timestamp", DateTime(timezone=True), server_default=func.now()),
)

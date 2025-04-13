from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData, func
from chat_app.database import metadata


messages = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, nullable=False),
    Column("text", String, nullable=False),
    Column("timestamp", DateTime(timezone=True), server_default=func.now())
)

from database import metadata
from sqlalchemy import Column, Integer, String, Table


User = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, nullable=False),
    Column("hashed_password", String, nullable=False),
)

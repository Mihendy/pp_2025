from pydantic import BaseModel
from sqlalchemy import Column, DateTime, func


def timestamp_columns():
    return [
        Column("created_at", DateTime, nullable=False, server_default=func.now()),
        Column("updated_at", DateTime, nullable=False, server_default=func.now(), onupdate=func.now()),
    ]


class MessageResponse(BaseModel):
    message: str

class DetailResponse(BaseModel):
    detail: str
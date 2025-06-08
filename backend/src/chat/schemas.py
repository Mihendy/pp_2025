from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChatCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChatResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    chat_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime = None

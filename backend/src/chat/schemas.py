from pydantic import BaseModel
from typing import Optional


class ChatCreate(BaseModel):
    name: str
    description: Optional[str] = None

from typing import Optional

from pydantic import BaseModel


class ChatCreate(BaseModel):
    name: str
    description: Optional[str] = None

from auth.tables import User
from auth.utils import get_current_user
from chat.schemas import ChatResponse
from chat.tables import Chat, ChatMember
from database import database
from fastapi import Depends, HTTPException
from sqlalchemy import select
from starlette import status


async def get_chat_if_member(
        chat_id: int,
        current_user: User = Depends(get_current_user),
):
    query = select(ChatMember).where(
        (ChatMember.c.chat_id == chat_id) &
        (ChatMember.c.user_id == current_user.id)
    )
    member = await database.fetch_one(query)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this chat"
        )

    query = select(Chat).where(Chat.c.id == chat_id)
    chat = await database.fetch_one(query)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    query = select(ChatMember.c.user_id).where(ChatMember.c.chat_id == chat_id)
    members = await database.fetch_all(query)
    member_ids = [m['user_id'] for m in members]

    chat_dict = dict(chat)
    chat_dict['members'] = member_ids

    return ChatResponse(**chat_dict)

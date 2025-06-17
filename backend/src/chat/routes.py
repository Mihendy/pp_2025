from datetime import datetime
from typing import List

from auth.tables import User
from auth.utils import get_current_user
from chat.managers import WSChatConnectionManager
from chat.schemas import ChatCreate, ChatResponse, ChatMessageResponse
from chat.tables import Chat, ChatMember, Message
from chat.utils import get_chat_if_member
from database import database
from fastapi import (APIRouter, Depends, HTTPException, WebSocket,
                     WebSocketDisconnect)
from sqlalchemy import select

from models.utils import MessageResponse

router = APIRouter(prefix="/chats", tags=["chats"])
manager = WSChatConnectionManager()


@router.get("/", response_model=list[ChatResponse])
async def get_chats(current_user: User = Depends(get_current_user)):
    """Получить список чатов, в которых состоит пользователь"""
    query = select(Chat.c.id, Chat.c.name, Chat.c.description, Chat.c.owner_id).join(ChatMember).where(
        ChatMember.c.user_id == current_user.id)
    chats = await database.fetch_all(query)
    results = []
    for chat in chats:
        members_query = select(ChatMember.c.user_id).where(ChatMember.c.chat_id == chat["id"])
        members = await database.fetch_all(members_query)
        results.append({
            "id": chat["id"],
            "name": chat["name"],
            "description": chat["description"],
            "owner_id": chat["owner_id"],
            "members": [m["user_id"] for m in members],
        })
    return results


@router.post("/", response_model=ChatResponse)
async def create_chat(chat: ChatCreate, current_user: User = Depends(get_current_user)):
    """Создать новый чат"""
    current_user_id = current_user.id
    query = Chat.insert().values(owner_id=current_user_id, name=chat.name, description=chat.description)
    chat_id = await database.execute(query)
    query = ChatMember.insert().values(chat_id=chat_id, user_id=current_user_id)
    await database.execute(query)
    query = ChatMember.select().where(ChatMember.c.chat_id == chat_id)
    members_result = await database.fetch_all(query)
    members = [m["user_id"] for m in members_result]
    return ChatResponse(id=chat_id, name=chat.name, description=chat.description, owner_id=current_user_id,
                        members=members)


@router.get("/{chat_id}", response_model=ChatResponse, responses={
    404: {"description": "Chat not found"},
    403: {"description": "You are not a member of this chat"}})
async def get_chat_info(chat=Depends(get_chat_if_member)):
    """Получить информацию о чате"""
    return chat


@router.get("/{chat_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
        chat=Depends(get_chat_if_member),
        skip: int = 0,
        limit: int = 50,
):
    """Получить последние сообщения из чата (от новых к старым)"""
    query = (
        select(Message)
        .where(Message.c.chat_id == chat.id)
        .order_by(Message.c.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    messages = await database.fetch_all(query)
    return messages  # фронт получает [новое, ..., старое]


@router.post("/{chat_id}/members",
             response_model=MessageResponse,
             responses={
                 400: {"description": "User is already a member of the chat"},
                 403: {"description": "Not authorized to add members to this chat"},
                 404: {"description": "Chat not found"},
             })
async def add_member(
        chat_id: int,
        user_id: int,
        current_user: User = Depends(get_current_user)
):
    """Добавить пользователя в чат"""

    # Проверяем, что текущий пользователь является владельцем чата
    query = select(Chat).where(Chat.c.id == chat_id)
    chat = await database.fetch_one(query)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add members to this chat")

    # Проверяем, является ли пользователь уже участником чата
    query = select(ChatMember).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    result = await database.fetch_one(query)

    if result:
        raise HTTPException(status_code=400, detail="User is already a member of the chat")

    # Добавляем нового участника
    query = ChatMember.insert().values(chat_id=chat_id, user_id=user_id)
    await database.execute(query)

    return {"message": "User added to chat"}


@router.delete("/{chat_id}/members/{user_id}",
               response_model=MessageResponse,
               responses={
                   400: {"description": "User is not in this chat"},
                   403: {"description": "Not authorized to remove this user from the chat"},
                   404: {"description": "Chat not found"},
               })
async def remove_member(
        chat_id: int,
        user_id: int,
        current_user: User = Depends(get_current_user)
):
    """Удалить пользователя из чата"""

    # Проверяем, что чат существует
    query = select(Chat).where(Chat.c.id == chat_id)
    chat = await database.fetch_one(query)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Проверяем, что пользователь является владельцем чата или он пытается удалить себя
    if chat.owner_id != current_user.id and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to remove this user from the chat")

    # Проверяем, что пользователь существует в чате
    query = select(ChatMember).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    result = await database.fetch_one(query)
    if not result:
        raise HTTPException(status_code=400, detail="User is not in this chat")

    # Удаляем участника
    query = ChatMember.delete().where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    await database.execute(query)

    return {"message": "User removed from chat"}


@router.websocket("/ws/{chat_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, user_id: int):
    await manager.connect(websocket, chat_id, user_id)
    try:
        # Отправляем историю сообщений при подключении
        print("here1")
        query = select(Message).where(Message.c.chat_id == chat_id).order_by(Message.c.created_at)
        messages = await database.fetch_all(query)
        print("here2")
        for message in messages:
            await websocket.send_text(f"{message['sender_id']}: {message['text']}")

        while True:
            message = await websocket.receive_text()

            # Сохраняем сообщение в базе данных
            query = Message.insert().values(chat_id=chat_id, sender_id=user_id, text=message)
            await database.execute(query)

            await manager.broadcast(f"{user_id}: {message}", chat_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)

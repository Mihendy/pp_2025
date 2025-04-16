from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from chat.managers import WSChatConnectionManager
from chat.schemas import ChatCreate
from chat.tables import Chat, ChatMember, Message
from database import database

router = APIRouter(prefix="/chats", tags=["chats"])
manager = WSChatConnectionManager()

@router.get("/")
async def get_chats(user_id: int):
    """Получить список чатов, в которых состоит пользователь"""
    query = select(Chat.c.id, Chat.c.name, Chat.c.description).join(ChatMember).where(ChatMember.c.user_id == user_id)
    chats = await database.fetch_all(query)
    return chats


@router.post("/")
async def create_chat(chat: ChatCreate):
    """Создать новый чат"""
    query = Chat.insert().values(name=chat.name, description=chat.description)
    chat_id = await database.execute(query)
    return {"chat_id": chat_id}


@router.get("/{chat_id}")
async def get_chat_info(chat_id: int):
    """Получить информацию о чате"""
    query = select(Chat).where(Chat.c.id == chat_id)
    chat = await database.fetch_one(query)
    return chat


@router.get("/{chat_id}/messages")
async def get_messages(chat_id: int, skip: int = 0, limit: int = 50):
    """Получить сообщения из чата"""
    query = select([Message]).where(Message.c.chat_id == chat_id).offset(skip).limit(limit)
    messages = await database.fetch_all(query)
    return messages


from fastapi import HTTPException


@router.post("/{chat_id}/members")
async def add_member(chat_id: int, user_id: int):
    """Добавить пользователя в чат"""

    query = select(ChatMember).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    result = await database.fetch_one(query)

    if result:
        raise HTTPException(status_code=400, detail="User is already a member of the chat")

    query = ChatMember.insert().values(chat_id=chat_id, user_id=user_id)
    await database.execute(query)

    return {"message": "User added to chat"}


@router.delete("/{chat_id}/members/{user_id}")
async def remove_member(chat_id: int, user_id: int):
    """Удалить пользователя из чата"""
    query = select(ChatMember).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    result = await database.fetch_one(query)

    if not result:
        raise HTTPException(status_code=400, detail="User is not in this chat")

    query = ChatMember.delete().where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
    await database.execute(query)
    return {"message": "User removed from chat"}


@router.websocket("/ws/{chat_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, user_id: int):
    # подключаем пользователя к чату
    await manager.connect(websocket, chat_id, user_id)

    try:
        # отправляем историю сообщений при подключении
        query = select(Message).where(Message.c.chat_id == chat_id).order_by(Message.c.timestamp)
        messages = await database.fetch_all(query)
        for message in messages:
            await websocket.send_text(message["text"])

        while True:

            message = await websocket.receive_text()

            query = Message.insert().values(chat_id=chat_id, text=message)
            await database.execute(query)

            await manager.broadcast(message, chat_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)
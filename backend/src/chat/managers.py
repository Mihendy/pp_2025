import json
from typing import List, Dict

from fastapi import HTTPException
from sqlalchemy import select
from starlette.websockets import WebSocket

from chat.tables import ChatMember
from database import database


class WSChatConnectionManager:
    def __init__(self):
        # Словарь, где ключ - chat_id, а значение - список активных соединений для этого чата
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: int, user_id: int):
        query = select([ChatMember]).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
        result = await database.fetch_one(query)
        if not result:
            raise HTTPException(status_code=403, detail="User is not a member of the chat")

        await websocket.accept()

        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:  # Удаление чата из словаря, если соединений больше нет
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: int):
        # Отправка сообщения всем подключенным пользователям в данном чате
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

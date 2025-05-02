from chat.tables import ChatMember
from database import database


from fastapi import WebSocket, HTTPException
from sqlalchemy import select
from typing import List, Dict

class WSChatConnectionManager:
    def __init__(self):
        # Словарь для хранения активных соединений по chat_id
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: int, user_id: int):
        """Подключение пользователя к чату"""
        query = select([ChatMember]).where(ChatMember.c.chat_id == chat_id, ChatMember.c.user_id == user_id)
        result = await database.fetch_one(query)
        if not result:
            raise HTTPException(status_code=403, detail="User is not a member of the chat")

        await websocket.accept()

        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        """Отключение пользователя от чата"""
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:  # Удаление чата из словаря, если соединений больше нет
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: int):
        """Отправка сообщения всем подключенным пользователям в чате"""
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    print(f"Error sending message to chat {chat_id}: {e}")
                    self.active_connections[chat_id].remove(connection)
                    await connection.close()

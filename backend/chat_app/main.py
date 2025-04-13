from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from chat_app.config import STATIC_DIR
from chat_app.models import messages
from chat_app.database import database, create_tables
import json


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))


manager = ConnectionManager()


@app.get("/")
async def get():
    return FileResponse("../static/index.html")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    # Отправка истории сообщений
    rows = await database.fetch_all(messages.select().order_by(messages.c.timestamp.desc()).limit(20))
    for row in reversed(rows):
        await websocket.send_text(
            json.dumps({"username": row["username"], "text": row["text"], "timestamp": str(row["timestamp"])}))

    try:
        while True:
            data = await websocket.receive_text()
            data_dict = json.loads(data)
            username = data_dict["username"]
            text = data_dict["text"]

            # Сохраняем в БД
            await database.execute(messages.insert().values(username=username, text=text))

            # Рассылаем всем
            await manager.broadcast({
                "username": username,
                "text": text
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

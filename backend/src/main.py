from contextlib import asynccontextmanager

from auth.routes import router as auth_router
from chat.routes import router as chat_router
from database import create_tables, database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(chat_router, prefix="/api/v1", tags=["chats"])

app.add_middleware(
    CORSMiddleware,  # Передаем сам класс, а не его тип
    allow_origins=["*"],  # Разрешить запросы с любых доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все HTTP методы
    allow_headers=["*"],  # Разрешить все заголовки
)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

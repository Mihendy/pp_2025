from contextlib import asynccontextmanager

from auth.routes import router as auth_router
from database import create_tables, database
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])

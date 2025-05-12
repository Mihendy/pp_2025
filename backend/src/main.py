from contextlib import asynccontextmanager
from pathlib import Path

from fastapi.security import HTTPAuthorizationCredentials

from auth.routes import router as auth_router
from auth.utils import security, get_user_by_token
from chat.routes import router as chat_router
from config import SUPPORTED_COLLABORA_EXTENSIONS, WOPI_BUCKET
from database import create_tables, database
from bucket import create_bucket_if_not_exists
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from wopi.router import router as wopi_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    create_bucket_if_not_exists(WOPI_BUCKET)
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(chat_router, prefix="/api/v1", tags=["chats"])
app.include_router(wopi_router, prefix="/api/v1", tags=["wopi"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/get-collabora-url")
async def get_collabora_url(file_path: str = Query(...), credentials: HTTPAuthorizationCredentials = Depends(security)):
    ext = Path(file_path).suffix.lower()
    token = credentials.credentials
    user = await get_user_by_token(token)

    if ext not in SUPPORTED_COLLABORA_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}")

    wopi_src = f"http://backend:8000/api/v1/wopi/files/{file_path}"
    collabora_url = f"http://localhost:9980/browser/f22c9fed45/cool.html?WOPISrc={wopi_src}&access_token={token}"
    return {"url": collabora_url}

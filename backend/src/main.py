from contextlib import asynccontextmanager
from pathlib import Path

from fastapi.security import HTTPAuthorizationCredentials

from auth.routes import auth_router, user_router
from auth.utils import security, get_user_by_token
from chat.routes import router as chat_router
from file_permission.routes import router as file_permission_router
from groups.routes import groups_router, invites_router
from config import SUPPORTED_COLLABORA_EXTENSIONS, WOPI_BUCKET
from database import create_tables, database
from bucket import create_bucket_if_not_exists
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware

from file_permission.schemas import RIGHT_TYPES
from file_permission.utils import check_file_access
from wopi.router import router as wopi_router

from pydantic import BaseModel


class CollaboraUrlResponse(BaseModel):
    url: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    create_bucket_if_not_exists(WOPI_BUCKET)
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])

app.include_router(user_router, prefix="/api/v1", tags=["users"])
app.include_router(chat_router, prefix="/api/v1", tags=["chats"])
app.include_router(wopi_router, prefix="/api/v1", tags=["wopi"])
app.include_router(file_permission_router, prefix="/api/v1", tags=["file_permission"])
app.include_router(groups_router, prefix="/api/v1", tags=["groups"])
app.include_router(invites_router, prefix="/api/v1", tags=["invites"])

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


@app.get("/get-collabora-url", response_model=CollaboraUrlResponse)
async def get_collabora_url(file_path: str = Query(...), credentials: HTTPAuthorizationCredentials = Depends(security)):
    ext = Path(file_path).suffix.lower()
    token = credentials.credentials
    user = await get_user_by_token(token)

    if not await check_file_access(file_path, user.id, RIGHT_TYPES.VIEWER):
        raise HTTPException(status_code=403)

    if ext not in SUPPORTED_COLLABORA_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}")

    wopi_src = f"http://backend:8000/api/v1/wopi/files/{file_path}"
    collabora_url = f"http://localhost:9980/browser/f22c9fed45/cool.html?WOPISrc={wopi_src}&access_token={token}"
    return {"url": collabora_url}

import logging
from pathlib import Path
from urllib.parse import unquote

from botocore.exceptions import ClientError

from auth.utils import get_user_by_token
from fastapi import APIRouter, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse, Response, StreamingResponse

from config import S3_CLIENT, WOPI_BUCKET
from file_permission.schemas import RIGHT_TYPES
from file_permission.utils import add_permission, check_file_access, get_file_owner_id
from models.utils import MessageResponse, DetailResponse
from wopi.schemas import FileInfoResponse

logging.basicConfig(
    format='%(levelname)s:     %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wopi", tags=["wopi"])


@router.get("/files/{file_path:path}/contents", include_in_schema=False)
def file_contents(file_path: str, access_token: str):
    obj = S3_CLIENT.get_object(Bucket=WOPI_BUCKET, Key=file_path)
    return StreamingResponse(
        obj['Body'],
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{file_path.split("/")[-1]}"'}
    )


@router.post("/files/{file_path:path}/contents", include_in_schema=False)
async def file_contents(file_path: str, request: Request, access_token: str):
    content = await request.body()
    try:
        S3_CLIENT.put_object(Bucket=WOPI_BUCKET, Key=file_path, Body=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error writing file to S3: " + str(e))
    return Response(status_code=200)


@router.get("/files/{file_path:path}", response_model=FileInfoResponse, responses={
    401: {"description": "Unauthorized"},
    404: {"description": "File not found"},
})
async def file_info(file_path: str, access_token: str):
    """Метод получения информации о файле для конкретного юзера (по токену)"""

    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    user = await get_user_by_token(access_token)

    can_write = await check_file_access(file_path, user.id, RIGHT_TYPES.EDITOR)
    owner_id = await get_file_owner_id(file_path)

    key = unquote(file_path)

    try:
        metadata = S3_CLIENT.head_object(Bucket=WOPI_BUCKET, Key=key)
    except S3_CLIENT.exceptions.ClientError:
        raise HTTPException(status_code=404, detail=f"File not found: {key}")

    return JSONResponse({
        "BaseFileName": Path(key).name,
        "Size": metadata["ContentLength"],
        "OwnerId": owner_id,
        "UserId": user.id,
        "Version": "1",
        "UserCanWrite": can_write,
        "UserFriendlyName": user.email,
    })


@router.post("/files/{file_path:path}", status_code=201, response_model=DetailResponse, responses={
    201: {"description": "File created successfully"},
    401: {"description": "Unauthorized"},
    409: {"description": "File already exists"},
    500: {"description": "Internal server error"}
})
async def file_create(file_path: str, access_token: str):
    """Метод для создания файла на S3 для конкретного юзера (по токену)"""

    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    user = await get_user_by_token(access_token)
    key = unquote(file_path)

    perm_id = await add_permission(file_path, user.id, RIGHT_TYPES.OWNER)

    file_exists = False
    try:
        S3_CLIENT.head_object(Bucket=WOPI_BUCKET, Key=key)
        file_exists = True
    except ClientError as e:
        if e.response["Error"]["Code"] != "404":
            raise HTTPException(status_code=500, detail="S3 error: " + str(e))

    if file_exists:
        return JSONResponse(status_code=409, content={"detail": "File already exists"})

    try:
        S3_CLIENT.put_object(Bucket=WOPI_BUCKET, Key=key, Body=b"")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error uploading file to S3: " + str(e))

    return Response(status_code=201, content={"detail": "File created successfully"})

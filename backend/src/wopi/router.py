import logging
from pathlib import Path
from urllib.parse import unquote

from botocore.exceptions import ClientError

from auth.utils import get_user_by_token
from fastapi import APIRouter, HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse, Response, StreamingResponse

from config import S3_CLIENT, WOPI_BUCKET

logging.basicConfig(
    format='%(levelname)s:     %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wopi", tags=["wopi"])


@router.get("/files/{file_path:path}/contents")
def file_contents(file_path: str, access_token: str):
    print(file_path)
    obj = S3_CLIENT.get_object(Bucket=WOPI_BUCKET, Key=file_path)
    return StreamingResponse(
        obj['Body'],
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{file_path.split("/")[-1]}"'}
    )


@router.post("/files/{file_path:path}/contents")
async def file_contents(file_path: str, request: Request, access_token: str):
    content = await request.body()

    try:
        S3_CLIENT.put_object(Bucket=WOPI_BUCKET, Key=file_path, Body=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error writing file to S3: " + str(e))

    return Response(status_code=200)


@router.get("/files/{file_path:path}")
async def file_info(file_path: str, access_token: str):
    """Метод получения информации о файле для конкретного юзера (по токену)"""

    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    user = await get_user_by_token(access_token)

    # TODO: сделать проверку на то, имеет ли user доступ к файлу и какие у него права

    key = unquote(file_path)

    try:
        metadata = S3_CLIENT.head_object(Bucket=WOPI_BUCKET, Key=key)
    except S3_CLIENT.exceptions.ClientError:
        raise HTTPException(status_code=404, detail=f"File not found: {key}")

    return JSONResponse({
        "BaseFileName": Path(key).name,
        "Size": metadata["ContentLength"],
        "OwnerId": "admin",
        "UserId": user.id,
        "Version": "1",
        "UserCanWrite": True,
        "UserFriendlyName": user.email,
    })


@router.post("/files/{file_path:path}")
async def file_create(file_path: str, access_token: str):
    """Метод для создания файла на S3 для конкретного юзера (по токену)"""

    if not access_token:
        raise HTTPException(status_code=401, detail="Missing token")

    user = get_user_by_token(access_token)
    key = unquote(file_path)

    # TODO: сделать запись в бд (нужна новая таблица), в которой будет s3_path (key), user_id (user.id), status (owner, editor, viewer)

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

    return Response(status_code=201)

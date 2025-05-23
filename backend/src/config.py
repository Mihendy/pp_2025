import os
from pathlib import Path

import boto3
from dotenv import load_dotenv

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

TOKEN_ENCODE_SECRET_KEY = os.getenv("TOKEN_ENCODE_SECRET_KEY")

MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD")

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 1
REFRESH_TOKEN_EXPIRE_DAYS = 30

SUPPORTED_COLLABORA_EXTENSIONS = [
    # Текстовые документы
    ".odt", ".doc", ".docx", ".rtf", ".txt",

    # Таблицы
    ".ods", ".xls", ".xlsx", ".csv",

    # Презентации
    ".odp", ".ppt", ".pptx",
]

S3_CLIENT = boto3.client(
    's3',
    endpoint_url='http://minio:9000',
    aws_access_key_id=MINIO_ROOT_USER,
    aws_secret_access_key=MINIO_ROOT_PASSWORD,
    region_name='us-east-1',
)

WOPI_BUCKET = "wopi"


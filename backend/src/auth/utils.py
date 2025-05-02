from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError, ExpiredSignatureError

from passlib.context import  CryptContext
from starlette import status

from auth.tables import User
from database import database

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 45
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def hash_password(password: str) -> str:
    """
    Хеширует пароль с помощью алгоритма SHA-256.
    :param password: исходный пароль
    :return: шестнадцатеричный хеш
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет соответствие пароля и его хеша.
    :param plain_password: исходный пароль
    :param hashed_password: ранее сохранённый хеш
    :return: True, если пароль соответствует хешу
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(email:str) -> str:
    """
    Создаёт токен доступа с заданным сроком действия.
    :param email: адрес электронной почты пользователя
    :return: JWT-токен
    """
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": datetime.now(timezone.utc) + expires_delta, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(email: str) -> str:
    """
    Создаёт токен обновления с заданным сроком действия.
    :param email: адрес электронной почты пользователя
    :return: JWT-токен
    """
    expires_delta =  timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": email, "exp": datetime.now(timezone.utc) + expires_delta, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token:str) -> dict:
    """
    Декодирует JWT-токен и возвращает его полезную нагрузку.
    :param token: JWT-токен
    :return: полезная нагрузка токена
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Получает текущего пользователя из токена доступа.
    :param token: JWT-токен доступа
    :return: объект пользователя
    """
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expected"
        )

    email= payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing email"
        )

    user = await database.fetch_one(User.select().where(User.c.email == email))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

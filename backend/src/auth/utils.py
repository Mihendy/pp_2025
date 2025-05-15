from datetime import datetime, timedelta, timezone

import jwt
from auth.tables import User
from config import ACCESS_TOKEN_EXPIRE_DAYS, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS
from database import database
from fastapi import Depends, HTTPException
from fastapi.security import (HTTPAuthorizationCredentials, HTTPBearer)
from jwt import ExpiredSignatureError, PyJWTError
from passlib.context import CryptContext
from starlette import status



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


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


def create_access_token(email: str) -> str:
    """
    Создаёт токен доступа с заданным сроком действия.
    :param email: адрес электронной почты пользователя
    :return: JWT-токен
    """
    expires_delta = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": email, "exp": datetime.now(timezone.utc) + expires_delta, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(email: str) -> str:
    """
    Создаёт токен обновления с заданным сроком действия.
    :param email: адрес электронной почты пользователя
    :return: JWT-токен
    """
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": email, "exp": datetime.now(timezone.utc) + expires_delta, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
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


async def get_user_by_token(access_token: str) -> User:
    payload = decode_token(access_token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expected"
        )

    email = payload.get("sub")
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
x

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Получает текущего пользователя из токена доступа.

    :param credentials: Объект, содержащий заголовки авторизации,
                        из которых извлекается токен.
    :return: Объект пользователя, найденный в базе данных.
    :raises HTTPException: Если токен не является access-токеном или
                            пользователь не найден в базе данных.
    """
    token = credentials.credentials
    return await get_user_by_token(token)

from auth.schemas import UserLogin, UserRegister, AuthResponse
from auth.tables import User
from auth.utils import (create_access_token, create_refresh_token,
                        decode_token, hash_password, verify_password)
from database import database
from fastapi import APIRouter, HTTPException
from starlette import status

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register",
             response_model=AuthResponse,
             responses={
                 400: {"description": "Пароли не совпадают"},
                 403: {"description": "Разрешен доступ только для студентов УрФУ"},
                 409: {"description": "Пользователь с таким email уже существует"}
             })
async def register(user: UserRegister):
    if not str(user.email).endswith('@urfu.me'):
        raise HTTPException(status_code=403, detail="Разрешен доступ только для студентов УрФУ")

    if user.password != user.password_confirm:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")

    existing = await database.fetch_one(User.select().where(User.c.email == user.email))
    if existing:
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже существует")

    hashed_password = hash_password(user.password)
    await database.execute(User.insert().values(email=user.email, hashed_password=hashed_password))

    return AuthResponse(message="Пользователь успешно зарегистрирован",
                        access_token=create_access_token(str(user.email)),
                        refresh_token=create_refresh_token(str(user.email)),
                        token_type="bearer")


@router.post("/login", response_model=AuthResponse)
async def login(user: UserLogin):
    email = user.email
    password = user.password
    existing_user = await database.fetch_one(User.select().where(User.c.email == email))

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    if not verify_password(password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    return AuthResponse(message="Успешный вход в систему",
                        access_token=create_access_token(str(user.email)),
                        refresh_token=create_refresh_token(str(user.email)),
                        token_type="bearer")


@router.post("/refresh", response_model=AuthResponse)
async def refresh(refresh_token: str):
    """
    Обновляет access и refresh токены, если refresh токен валиден.
    """
    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ожидался refresh токен"
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен не содержит информации о пользователе"
        )

    existing_user = await database.fetch_one(User.select().where(User.c.email == email))
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )

    return AuthResponse(message="Токены успешно обновлены",
                        access_token=create_access_token(str(email)),
                        refresh_token=create_refresh_token(str(email)),
                        token_type="bearer")

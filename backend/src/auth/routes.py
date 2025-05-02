from auth.schemas import UserLogin, UserRegister, Token
from auth.tables import User
from auth.utils import hash_password, verify_password, create_access_token
from database import database
from fastapi import APIRouter, HTTPException
from starlette import status
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from auth.utils import create_access_token, create_refresh_token, verify_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    if not str(user.email).endswith('@urfu.me'):
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Разрешен доступ только для студентов УрФУ")

    if user.password != user.password_confirm:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Пароли не совпадают")

    existing = await database.fetch_one(User.select().where(User.c.email == user.email))
    if existing:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже существует")

    hashed_password = hash_password(user.password)
    await database.execute(User.insert().values(email=user.email, hashed_password=hashed_password))

    return {
        "message": "Пользователь успешно зарегистрирован",
        "access_token": create_access_token(user.email),
        "refresh_token": create_refresh_token(user.email),
        "token_type": "bearer"
    }


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    existing_user = await database.fetch_one(User.select().where(User.c.email == user.email))

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    if not verify_password(user.password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    return {"message": "Успешный вход в систему",
            "access_token": create_access_token(user.email),
            "refresh_token": create_refresh_token(user.email),
            "token_type": "bearer"
            }


@router.post("/refresh", response_model= Token)
async def refresh(refresh_token:str):
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный refresh токен!")

    email = payload.get("sub")
    existing_user = await database.fetch_one(User.select().where(User.c.email == email))
    if not existing_user:
        raise  HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Пользователь не найден!"
        )

    return {
        "message": "Токен обновлен",
        "access_token": create_access_token(email),
        "refresh_token": create_refresh_token(email),
        "token_type": "bearer"
    }

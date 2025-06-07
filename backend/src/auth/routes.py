from auth.schemas import UserLogin, UserRegister, AuthResponse, UserInfo
from auth.tables import User
from auth.utils import (create_access_token, create_refresh_token,
                        decode_token, hash_password, verify_password, get_current_user)
from database import database
from fastapi import APIRouter, HTTPException, Depends
from starlette import status

from groups.tables import Groups, UserGroups

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register",
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
    user_id = await database.execute(User.insert().values(email=user.email, hashed_password=hashed_password))

    return AuthResponse(message="Пользователь успешно зарегистрирован",
                        access_token=create_access_token(str(user.email)),
                        refresh_token=create_refresh_token(str(user.email)),
                        token_type="bearer",
                        user_id=user_id)


@auth_router.post("/login",
                  response_model=AuthResponse,
                  responses={
                      401: {"description": "Неверный email или пароль"},
                  })
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
                        token_type="bearer",
                        user_id=existing_user.id)


@auth_router.post("/refresh",
                  response_model=AuthResponse,
                  responses={
                      401: {
                          "description": "Ошибки авторизации",
                          "content": {
                              "application/json": {
                                  "examples": {
                                      "invalid_token_type": {
                                          "summary": "Неверный тип токена",
                                          "value": {"detail": "Ожидался refresh токен"},
                                      },
                                      "missing_subject": {
                                          "summary": "Отсутствует идентификатор пользователя",
                                          "value": {"detail": "Токен не содержит информации о пользователе"},
                                      },
                                      "user_not_found": {
                                          "summary": "Пользователь не существует",
                                          "value": {"detail": "Пользователь не найден"},
                                      }
                                  }
                              }
                          }
                      }
                  })
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
                        token_type="bearer",
                        user_id=existing_user.id)


user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.get("/me/", response_model=UserInfo, responses={401: {"description": "Неавторизованный доступ"}})
async def get_user(current_user=Depends(get_current_user)):
    user_id = current_user.id

    creator_rows = await database.fetch_all(
        query=Groups.select().with_only_columns(Groups.c.id).where(Groups.c.creator_id == user_id)
    )
    group_creator_ids = [row.id for row in creator_rows]

    member_rows = await database.fetch_all(
        query=UserGroups.select().with_only_columns(UserGroups.c.group_id).where(UserGroups.c.user_id == user_id)
    )
    group_member_ids = [row.group_id for row in member_rows]

    return UserInfo(
        email=current_user.email,
        id=user_id,
        group_creator_ids=group_creator_ids,
        group_member_ids=group_member_ids,
    )


@user_router.get("/{user_id}/", response_model=UserInfo,
                 responses={404: {"description": "Пользователь не найден"}})
async def get_user_by_id(user_id: int):
    user = await database.fetch_one(User.select().where(User.c.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    creator_rows = await database.fetch_all(
        query=Groups.select().with_only_columns(Groups.c.id).where(Groups.c.creator_id == user_id)
    )
    group_creator_ids = [row.id for row in creator_rows]

    member_rows = await database.fetch_all(
        query=UserGroups.select().with_only_columns(UserGroups.c.group_id).where(UserGroups.c.user_id == user_id)
    )
    group_member_ids = [row.group_id for row in member_rows]

    return UserInfo(
        email=user.email,
        id=user.id,
        group_creator_ids=group_creator_ids,
        group_member_ids=group_member_ids,
    )


@user_router.get("/", response_model=list[UserInfo])
async def get_all_users():
    users = await database.fetch_all(User.select())
    if not users:
        return []

    user_info_list = []
    for user in users:
        creator_rows = await database.fetch_all(
            query=Groups.select().with_only_columns(Groups.c.id).where(Groups.c.creator_id == user.id)
        )
        group_creator_ids = [row.id for row in creator_rows]

        member_rows = await database.fetch_all(
            query=UserGroups.select().with_only_columns(UserGroups.c.group_id).where(UserGroups.c.user_id == user.id)
        )
        group_member_ids = [row.group_id for row in member_rows]

        user_info_list.append(UserInfo(
            email=user.email,
            id=user.id,
            group_creator_ids=group_creator_ids,
            group_member_ids=group_member_ids,
        ))

    return user_info_list

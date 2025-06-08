from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password:str
    password_confirm: str


class UserLogin(BaseModel):
    email: EmailStr
    password:str

class AuthResponse(BaseModel):
    message: str
    access_token: str
    refresh_token: str
    token_type: str
    user_id: int

class UserInfo(BaseModel):
    id: int
    email: EmailStr
    group_member_ids: list[int]
    group_creator_ids: list[int]





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




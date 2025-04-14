from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import sqlite3
import hashlib

app = FastAPI()


def all_users_db():
    conn = sqlite3.connect('all_users_db')
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()


all_users_db()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    password_confirm: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()


@app.post("/register")
def register(user: UserRegister):
    if not user.email.endswith('@urfu.me'):
        raise HTTPException(status_code=400, detail="Разрешен доступ только для студентов УрФУ")
    if user.password != user.password_confirm:
        raise HTTPException(status_code=400, detail="Пароли не совпадают!")

    hashed_password = hash_password(user.password)

    conn = sqlite3.connect('all_users_db')
    cur = conn.cursor()

    try:
        cur.execute("SELECT email FROM users WHERE email = ?", (user.email,))
        if cur.fetchone() is not None:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

        cur.execute("INSERT INTO users (email, password) VALUES (?, ?)",
                    (user.email, hashed_password))
        conn.commit()

        return {"message": "Пользователь успешно зарегистрирован"}

    finally:
        conn.close()


@app.post("/login")
def login(user: UserLogin):
    hashed_password = hash_password(user.password)

    conn = sqlite3.connect('all_users_db')
    cur = conn.cursor()

    try:
        cur.execute("SELECT email FROM users WHERE email = ? AND password = ?",
                    (user.email, hashed_password))
        user_exists = cur.fetchone()

        if user_exists is None:
            raise HTTPException(status_code=401, detail="Неверный email или пароль")

        return {"message": "Успешный вход в систему"}

    finally:
        conn.close()
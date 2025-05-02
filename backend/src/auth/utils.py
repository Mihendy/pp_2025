import hashlib
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import  CryptContext
from sqlalchemy.util import deprecated

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 45
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# TODO: Заменить SHA-256 на bcrypt через passlib для безопасности
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
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": datetime.utcnow() + expires_delta}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(email: str) -> str:
    expires_delta =  timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": email, "exp": datetime.utcnow() + expires_delta}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token:str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


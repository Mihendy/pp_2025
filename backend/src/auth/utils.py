import hashlib


# TODO: Заменить SHA-256 на bcrypt через passlib для безопасности
def hash_password(password: str) -> str:
    """
    Хеширует пароль с помощью алгоритма SHA-256.
    :param password: исходный пароль
    :return: шестнадцатеричный хеш
    """
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет соответствие пароля и его хеша.
    :param plain_password: исходный пароль
    :param hashed_password: ранее сохранённый хеш
    :return: True, если пароль соответствует хешу
    """
    return hash_password(plain_password) == hashed_password

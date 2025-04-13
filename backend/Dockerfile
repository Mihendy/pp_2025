FROM python:3.10.11-slim-buster

ENV PYTHONUNBUFFERED=1

# Установка зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Создание виртуального окружения
RUN python3 -m venv /opt/venv

# Активируем виртуалку и добавляем её в PATH
ENV PATH="/opt/venv/bin:$PATH"

# Копирование и установка зависимостей
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копирование проекта
COPY . .

WORKDIR /backend

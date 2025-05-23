# frontend/Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Установим простой сервер для отдачи сборки
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "80"]
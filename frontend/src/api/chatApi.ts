import {ChatRequest, ChatResponse} from '@/types/chat.types';
import {use} from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 🔒 Получить список чатов
export const getChats = async (): Promise<ChatResponse[]> => {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/api/v1/chats/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось загрузить чаты');
    }

    return await response.json();
};

// 💬 Создание нового чата
export const createChat = async (data: ChatRequest): Promise<ChatResponse> => {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/api/v1/chats/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось создать чат');
    }

    return await response.json();
};

// 👤 Добавить пользователя в чат
export const addUserToChat = async (chatId: number, user_id: number): Promise<{ message: string }> => {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/api/v1/chats/${chatId}/members?user_id=${user_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось добавить пользователя');
    }

    return await response.json();
};

export const removeUserFromChat = async (chatId: number, user_id: number): Promise<{ message: string }> => {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/api/v1/chats/${chatId}/members/${user_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось удалить пользователя');
    }

    return await response.json();
}
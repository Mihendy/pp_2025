// src/api/authApi.ts

// src/api/authApi.ts

import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const registerUser = async (
    data: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch {
            throw new Error('Ошибка сети');
        }
        throw new Error((errorData as any).detail || 'Ошибка регистрации');
    }

    return await response.json();
};
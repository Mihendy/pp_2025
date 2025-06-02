// src/types/auth.types.ts

export interface RegisterRequest {
    email: string;
    password: string;
    password_confirm: string;
}

export interface RegisterResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    token_type: string;
}
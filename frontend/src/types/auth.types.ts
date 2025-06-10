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

// 🔒 Добавлены типы для логина
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    token_type: string;
}
// src/types/auth.types.ts

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
}


export interface RefreshRequest {
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
}
// src/types/chat.types.ts

export interface ChatRequest {
  name: string;
  description?: string;
}

export interface ChatResponse {
  id: number;
  name: string;
  description?: string;
}
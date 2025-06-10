// src/api/fetchWithAuth.ts
import { refreshToken } from './authApi';
import { AuthResponse } from '@/types/auth.types';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Подписчики на обновление токена
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Уведомляем подписчиков о новом токене
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Обёртка вокруг fetch — проверяет 401 и обновляет токен
export const fetchWithAuth = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('Нет токена доступа');
  }

  const request = new Request(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const response = await fetch(request);

  // ❗ Токен истёк — нужно обновить
  if (response.status === 401) {
    const retryOriginalRequest = new Promise<Response>((resolve, reject) => {
      subscribeTokenRefresh((newToken: string) => {
        const retryReq = new Request(input, {
          ...init,
          headers: {
            ...(init?.headers || {}),
            'Authorization': `Bearer ${newToken}`,
          },
        });

        fetch(retryReq).then(resolve).catch(reject);
      });
    });

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const data = await refreshToken();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', String(data.user_id));

        isRefreshing = false;
        onRefreshed(data.access_token);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    }

    return retryOriginalRequest;
  }

  return response;
};
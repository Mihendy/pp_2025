// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { refreshToken } from '../api/authApi';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user_id: number | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
    user_id: Number(localStorage.getItem('user_id')) || null,
    loading: true,
    error: null,
  });

  const refreshAccessToken = async () => {
    try {
      const data = await refreshToken();

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', String(data.user_id));

      setAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user_id: data.user_id,
        loading: false,
        error: null,
      });

      return data.access_token;
    } catch (err: any) {
      setAuth((prev) => ({ ...prev, loading: false, error: err.message }));
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken && !refreshToken) {
        setAuth({ access_token: null, refresh_token: null, user_id: null, loading: false, error: null });
        return;
      }

      // Попробуем обновить токен
      const newToken = await refreshAccessToken();
      if (!newToken) {
        // Если не удалось обновить — пользователь неавторизован
        setAuth({ access_token: null, refresh_token: null, user_id: null, loading: false, error: null });
      }
    };

    checkAuth();
  }, []);

  return { ...auth, refreshAccessToken };
};
// src/App.tsx

import React, { useState } from 'react';
import './css/App.css';
import { Link, useNavigate } from 'react-router-dom';

// 🔐 Импорты для авторизации
import type { LoginRequest } from '@/types/auth.types';
import { loginUser } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';

const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    // 🧪 Убран тестовый вход — теперь только через API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const data: LoginRequest = { email, password };

        try {
            console.log('📤 Отправка данных:', data);
            const result = await loginUser(data); // 🔥 Реальный запрос к бэкенду
            console.log('✅ Авторизация успешна:', result);

            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);

            navigate('/dashboard');
        } catch (err: any) {
            console.error('❌ Ошибка авторизации:', err.message);
            setError(err.message || 'Неверные данные');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1 className="welcome-text">ДОБРО ПОЖАЛОВАТЬ!</h1>

            <form onSubmit={handleSubmit} className="register-form">
                {error && <p className="error-message">{error}</p>}

                <label className="label">Email</label>
                <input
                    name="email"
                    type="email"
                    className="input-field"
                    placeholder="Введите почту"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <label className="label">Пароль</label>
                <input
                    name="password"
                    type="password"
                    className="input-field"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    className="test-login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Войти'}
                    <i className="arrow-icon">&#8594;</i>
                </button>
            </form>

            <p className="register-link">
                Нет аккаунта?{' '}
                <Link to="/register" style={{ color: 'white', textDecoration: 'underline' }}>
                    Зарегистрируйтесь
                </Link>
            </p>
        </div>
    );
};

export default App;
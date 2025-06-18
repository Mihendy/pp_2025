// src/App.tsx

import React, {useState} from 'react';
import './css/App.css';
import {Link, useNavigate} from 'react-router-dom';

import type {LoginRequest} from '@/types/auth.types';
import {loginUser} from '@/api/authApi';
import {useAuth} from '@/hooks/useAuth';

const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const data: LoginRequest = {email, password};

        try {
            const result = await loginUser(data);
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Неверные данные');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="auth-title">Вход в аккаунт</h1>
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}

                <div className="input-group">
                    <label className="label">Почта</label>
                    <input
                        name="email"
                        type="email"
                        className="input-field"
                        placeholder="Введите почту"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </div>

                <div className="input-group">
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
                        autoComplete="current-password"
                    />
                </div>

                <button
                    type="submit"
                    className="auth-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Войти'}
                    <span className="arrow-icon">&#8594;</span>
                </button>
            </form>

            <div className="auth-bottom-link">
                Нет аккаунта?{' '}
                <Link to="/register" className="auth-link">
                    Зарегистрируйтесь
                </Link>
            </div>
        </div>
    );
};

export default App;

// src/components/RegisterForm.tsx

import React, {useState} from 'react';
import {registerUser} from '@/api/authApi';
import type {RegisterRequest} from '@/types/auth.types';

interface RegisterFormProps {
    onRegisterSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({onRegisterSuccess}) => {
    const [formData, setFormData] = useState<RegisterRequest>({
        email: '',
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await registerUser(formData);
            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err: any) {
            setError(err.message || 'Не удалось зарегистрироваться');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="input-group">
                <label className="label">Почта</label>
                <input
                    name="email"
                    type="email"
                    className="input-field"
                    placeholder="Введите почту"
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                />
            </div>

            <div className="input-group">
                <label className="label">Подтвердите пароль</label>
                <input
                    name="password_confirm"
                    type="password"
                    className="input-field"
                    placeholder="Подтвердите пароль"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                />
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
                <span className="arrow-icon">&#8594;</span>
            </button>
        </form>
    );
};

export {RegisterForm};

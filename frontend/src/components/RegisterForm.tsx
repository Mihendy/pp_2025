// src/components/RegisterForm.tsx

import React, { useState } from 'react';
import { registerUser } from '@/api/authApi';
import type { RegisterRequest } from '@/types/auth.types';

interface RegisterFormProps {
    onRegisterSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
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
            console.log('📤 Отправка данных:', formData);
            const result = await registerUser(formData);
            console.log('✅ Регистрация успешна:', result);
            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err: any) {
            console.error('❌ Ошибка регистрации:', err.message);
            setError(err.message || 'Не удалось зарегистрироваться');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            {error && <p className="error-message">{error}</p>}

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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
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
                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" className="next-button" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : 'Продолжить'}
                <i className="arrow-icon">&#8594;</i>
            </button>
        </form>
    );
};

export { RegisterForm };
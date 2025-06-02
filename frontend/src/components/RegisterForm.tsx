import React, { useState } from 'react';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';
import { registerUser } from '../api/authApi';
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
            localStorage.setItem('access_token', result.access_token);
            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err: any) {
            console.error('❌ Ошибка регистрации:', err.message);
            setError(err.message || 'Не удалось зарегистрироваться');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* Поля формы */}
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Пароль" />
            <input name="password_confirm" type="password" value={formData.password_confirm} onChange={handleChange} placeholder="Подтвердите пароль" />
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : 'Продолжить'}
            </button>
        </form>
    );
};

export default RegisterForm;
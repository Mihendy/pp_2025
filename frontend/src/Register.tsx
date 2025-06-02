import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('✅ Форма отправляется...');
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            console.log('📡 Отправляем запрос на:', `${API_URL}/api/v1/auth/register`);
            const response = await fetch(`${API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    password_confirm: confirmPassword,
                }),
            });

            console.log('📥 Получен ответ. Статус:', response.status);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Ошибка регистрации');
            }

            const data = await response.json();
            console.log('🎉 Регистрация успешна:', data);
            navigate('/dashboard'); // Переход на главную страницу
        } catch (err: any) {
            console.error('❌ Ошибка регистрации:', err);
            setError(err.message || 'Не удалось зарегистрироваться');
        }
    };

    return (
        <div className="register-container">
            <h1 className="welcome-text">РЕГИСТРАЦИЯ</h1>

            {/* Тестовая метка для проверки рендера */}
            <p style={{ color: '#ccc', fontSize: '12px' }}>Форма загружена</p>

            <form onSubmit={handleSubmit} className="register-form">
                {error && <p className="error-message">{error}</p>}

                {/* Почта */}
                <div className="input-group">
                    <label className="label">Почта</label>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="Введите почту"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Пароль */}
                <div className="input-group">
                    <label className="label">Пароль</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Подтверждение пароля */}
                <div className="input-group">
                    <label className="label">Подтвердите пароль</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Подтвердите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Кнопка с явной проверкой onClick */}
                <button
                    type="submit"
                    className="next-button"
                    onClick={() => console.log('🔵 Кнопка "Продолжить" нажата')}
                >
                    Продолжить
                    <i className="arrow-icon">&#8594;</i>
                </button>
            </form>
        </div>
    );
};

export default Register;
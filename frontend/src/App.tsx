// src/App.tsx
import React, { useState } from 'react';
import './css/App.css';
import { Link, useNavigate } from 'react-router-dom';

const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleTestLogin = () => {
        navigate('/dashboard');
    };

    return (
        <div className="login-container">
            <h1 className="welcome-text">ДОБРО ПОЖАЛОВАТЬ!</h1>
            <form>
                <label className="label">Почта</label>
                <input
                    type="email"
                    className="input-field"
                    placeholder="Введите почту"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="label">Пароль</label>
                <input
                    type="password"
                    className="input-field"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="button" className="test-login-button" onClick={handleTestLogin}>
                    Войти (тест)
                </button>
            </form>

            <p className="register-link">
                <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                    Зарегистрируйтесь, если нет аккаунта
                </Link>
            </p>
        </div>
    );
};

export default App;
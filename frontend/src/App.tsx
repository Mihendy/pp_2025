import React, { useState } from 'react';
import './App.css';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <div className="login-container">
            <h1 className="welcome-text">ДОБРО ПОЖАЛОВАТЬ!</h1>
            <form onSubmit={handleSubmit}>
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

                <button type="submit" className="submit-button">
                    Войти
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
import React, { useState } from 'react';
import './Register.css';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Confirm Password:', confirmPassword);
    };

    return (
        <div className="register-container">
            <h1 className="welcome-text">РЕГИСТРАЦИЯ</h1>
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

                <label className="label">Подтвердите пароль</label>
                <input
                    type="password"
                    className="input-field"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit" className="next-button">
                    <span>Продолжить</span>
                    <i className="arrow-icon">&#8594;</i>
                </button>
            </form>
        </div>
    );
};

export default Register;
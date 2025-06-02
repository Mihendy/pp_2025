// src/pages/RegisterPage.tsx
import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton'; 

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        console.log('🎉 Регистрация прошла успешно');
        navigate('/dashboard');
    };

    return (
        <div className="register-container">
            <BackButton />
            <h1 className="welcome-text">РЕГИСТРАЦИЯ</h1>
            <RegisterForm onRegisterSuccess={handleSuccess} />
        </div>
    );
};

export default RegisterPage;
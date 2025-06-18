// src/pages/RegisterPage.tsx

import React from 'react';
import {RegisterForm} from '../components/RegisterForm';
import {useNavigate} from 'react-router-dom';
import {BackButton} from '../components/BackButton';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            <BackButton/>
            <h1 className="auth-title">Регистрация</h1>
            <RegisterForm onRegisterSuccess={handleSuccess}/>
        </div>
    );
};

export default RegisterPage;

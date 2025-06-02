// src/components/BackButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BackButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button className="back-button" onClick={() => navigate(-1)}>
            ← Назад
        </button>
    );
};
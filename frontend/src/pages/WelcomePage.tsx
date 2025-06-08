import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const [showCloseButton, setShowCloseButton] = useState(false);

    // Через 1 секунду показываем крестик
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCloseButton(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        navigate('/dashboard');
    };

    return (
        <div className="welcome-container">
            {/* ✅ Крестик появляется через 1 секунду */}
            {showCloseButton && (
                <button className="close-button" onClick={handleClose}>
                    ✕
                </button>
            )}

            <h1>Добро пожаловать!</h1>
            <p>Спасибо за регистрацию.</p>

            {/* 🎉 Анимированные шары */}
            <div className="ball-container">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="ball"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 2 + 2}s`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default WelcomePage;
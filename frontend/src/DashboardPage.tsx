import React from 'react';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
    return (
        <div className="dashboard-container">
            {/* Заголовок / шапка */}
            <header className="dashboard-header">
                <h1>Добро пожаловать!</h1>

                {/* Меню приложений или иконка настроек */}
                <div className="header-right">
                    <button className="settings-button">⚙️</button>
                </div>
            </header>

            {/* Основная область (например, чат) */}
            <main className="dashboard-main">
                <div className="chat-area">
                    <p>Здесь будет ваш чат</p>
                </div>
            </main>

            {/* Блок с мини-приложениями */}
            <aside className="mini-apps">
                <h2>Мини-приложения</h2>
                <ul>
                    <li>Калькулятор</li>
                    <li>Блокнот</li>
                    <li>Погода</li>
                </ul>
            </aside>
        </div>
    );
};

export default DashboardPage;
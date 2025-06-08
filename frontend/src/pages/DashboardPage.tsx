// src/pages/DashboardPage.tsx
import React from 'react';
import '@/css/DashboardPage.css'; // Подключаем стили

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Нижняя панель с иконками */}
      <footer className="dashboard-footer">
        <button className="dashboard-icon settings" title="Настройки">
          ⚙️
        </button>
        <button className="dashboard-icon news" title="Новости">
          📰
        </button>
        <button className="dashboard-icon apps" title="Список приложений">
          {/* Пустая иконка для списка приложений */}
        </button>
      </footer>
    </div>
  );
};

export { DashboardPage };
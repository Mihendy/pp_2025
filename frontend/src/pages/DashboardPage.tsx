// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import '@/css/DashboardPage.css'; // Подключаем стили
import ChatWindow from '../components/ChatWindow';

const DashboardPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Закрытие окна при клике вне чата
  const handleClickOutside = (e: MouseEvent) => {
    const chatWindow = document.querySelector('.chat-window');
    
    if (chatWindow && !chatWindow.contains(e.target as Node)) {
      setIsChatOpen(false);
    }
  };

  // Подписываемся/отписываемся от события
  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);
  
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
          💾
        </button>
      </footer>

      {/* Иконка чата на правом крае */}
      <button
        className="chat-icon"
        title="Чаты"
        onClick={() => setIsChatOpen((prev) => !prev)}
      >
        💬
      </button>

      {/* Окно чатов */}
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default DashboardPage;
// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import '@/css/DashboardPage.css';
import ChatWindow from '../components/ChatWindow';
import GroupsWindow from '../components/GroupsWindow';
import SettingsModal from '../components/SettingsModal'; // ← новый компонент

const DashboardPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [groupWidth, setGroupWidth] = useState(() => Math.max(window.innerWidth * 0.3, 250));
  const getDefaultChatWidth = () => Math.max(window.innerWidth * 0.3, 300);
  const [chatWidth, setChatWidth] = useState(getDefaultChatWidth());

  useEffect(() => {
    const handleResize = () => {
      setChatWidth(getDefaultChatWidth());
    };
    if (isChatOpen) {
      window.addEventListener('resize', handleResize);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [isChatOpen]);

  return (
    <div className="dashboard-container">
      {/* Нижняя панель с иконками */}
      <footer className="dashboard-footer">
        <button
          className="dashboard-icon settings"
          title="Настройки"
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️
        </button>
        <button className="dashboard-icon news" title="Новости">📰</button>
        <button className="dashboard-icon apps" title="Приложения">💾</button>
      </footer>

      {/* Иконка чатов справа */}
      <button
        className="chat-tab"
        title={isChatOpen ? 'Скрыть чаты' : 'Чаты'}
        onClick={() => setIsChatOpen((v) => !v)}
        style={{
          right: isChatOpen ? `${chatWidth}px` : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1002,
          '--chat-width': `${chatWidth}px`,
        } as React.CSSProperties}
      >
        💬
      </button>

      {/* Окно чатов */}
      <ChatWindow
        onClose={() => setIsChatOpen(false)}
        chatWidth={chatWidth}
        setChatWidth={setChatWidth}
        isOpen={isChatOpen}
      />

      {/* Иконка групп слева */}
      <button
        className="groups-tab"
        title={isGroupsOpen ? 'Скрыть группы' : 'Группы'}
        onClick={() => setIsGroupsOpen((v) => !v)}
        style={{
          left: isGroupsOpen ? `${groupWidth}px` : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          '--group-width': `${groupWidth}px`,
        } as React.CSSProperties}
      >
        👥
      </button>

      {/* Окно групп */}
      <GroupsWindow
        onClose={() => setIsGroupsOpen(false)}
        groupWidth={groupWidth}
        setGroupWidth={setGroupWidth}
        isOpen={isGroupsOpen}
      />

      {/* Модальное окно настроек */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default DashboardPage;
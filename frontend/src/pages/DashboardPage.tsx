// src/pages/DashboardPage.tsx
import React, {useState, useEffect} from 'react';
import '@/css/DashboardPage.css';
import ChatWindow from '../components/ChatWindow';

const DashboardPage: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const getDefaultChatWidth = () => Math.max(window.innerWidth * 0.3, 250);
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
                <button className="dashboard-icon settings" title="Настройки">⚙️</button>
                <button className="dashboard-icon news" title="Новости">📰</button>
                <button className="dashboard-icon apps" title="Список приложений">💾</button>
            </footer>

            {/* Закладка чата (всегда присутствует) */}
            <button
                className="chat-tab"
                title={isChatOpen ? "Скрыть чаты" : "Открыть чаты"}
                onClick={() => setIsChatOpen(v => !v)}
                style={{
                    position: 'fixed',
                    top: '50%',
                    right: isChatOpen ? `${chatWidth}px` : 0,
                    transform: 'translateY(-50%)',
                    zIndex: 1002,
                    '--chat-width': `${chatWidth}px`,
                } as React.CSSProperties}
            >
                💬
            </button>


            {/* Окно чата */}
            <ChatWindow
                onClose={() => setIsChatOpen(false)}
                chatWidth={chatWidth}
                setChatWidth={setChatWidth}
                isOpen={isChatOpen}
            />
        </div>
    );
};

export default DashboardPage;

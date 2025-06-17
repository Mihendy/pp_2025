// src/pages/ChatPage.tsx
import React, {useEffect, useRef, useState} from 'react';
import {fetchAllUsers} from '@/api/userApi';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/chats/ws';

interface Message {
    sender_id: number;
    text: string;
    // timestamp?: string;
}

interface UserInfo {
    id: number;
    email: string;
}

const ChatPage: React.FC<{ chat: any, userId: number }> = ({chat, userId}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Храним пользователей
    const [allUsers, setAllUsers] = useState<UserInfo[]>([]);

    // Получаем пользователей один раз при монтировании чата
    useEffect(() => {
        fetchAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
    }, []);

    // Соответствие id → email
    const idToEmail: Record<number, string> = {};
    for (const u of allUsers) idToEmail[u.id] = u.email;

    // Подключение к WebSocket при выборе чата
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/${chat.id}/${userId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            // Ожидаем строку: "user_id: текст"
            const data = event.data;
            const match = data.match(/^(\d+):\s?(.*)$/);
            if (match) {
                setMessages(prev => [
                    ...prev,
                    {sender_id: Number(match[1]), text: match[2]}
                ]);
            }
        };

        ws.onclose = () => {
            wsRef.current = null;
        };

        return () => {
            ws.close();
        };
    }, [chat.id, userId]);

    // Автоскролл вниз при новых сообщениях
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
        wsRef.current.send(input);
        setInput('');
    };

    function formatName(id: number) {
        if (id === userId) return "Вы";
        if (idToEmail[id]) return idToEmail[id];
        return `User ${id}`;
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div className="chat-messages-list" style={{flex: 1, overflowY: "auto"}}>
                {messages.length === 0 && (
                    <div style={{color: "#bbb"}}>Нет сообщений</div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={
                            msg.sender_id === userId
                                ? 'message-bubble message-own'
                                : 'message-bubble message-other'
                        }
                    >
                        <div className="message-content">{msg.text}</div>
                        <div className="message-meta">{formatName(msg.sender_id)}</div>
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <form onSubmit={sendMessage} style={{display: "flex", gap: 8, padding: 12}}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{
                        flex: 1,
                        borderRadius: 6,
                        padding: 8,
                        border: "1px solid #555",
                        background: "#222",
                        color: "#fff"
                    }}
                    placeholder="Написать сообщение..."
                />
                <button className={"send-message-btn"} type="submit">
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatPage;

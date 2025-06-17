// src/components/ChatMembersPanel.tsx
import React, {useState, useEffect} from 'react';
import {fetchAllUsers} from '@/api/userApi';

interface ChatMembersPanelProps {
    chat: {
        id: number;
        owner_id: number;
        members: number[];
    };
    currentUserId: number;
    onAddUser: (userId: number) => void;
    onRemoveUser: (userId: number) => void;
    onClose: () => void;
}

interface UserInfo {
    id: number;
    email: string;
}

const ChatMembersPanel: React.FC<ChatMembersPanelProps> = ({
                                                               chat,
                                                               currentUserId,
                                                               onAddUser,
                                                               onRemoveUser,
                                                               onClose
                                                           }) => {
    const [newUserEmail, setNewUserEmail] = useState('');
    const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const isOwner = currentUserId === chat.owner_id;

    useEffect(() => {
        fetchAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
    }, []);

    // Быстрый доступ: id -> email и email -> id
    const idToEmail: Record<number, string> = {};
    const emailToId: Record<string, number> = {};
    for (const u of allUsers) {
        idToEmail[u.id] = u.email;
        emailToId[u.email] = u.id;
    }

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const email = newUserEmail.trim();
        if (!email) {
            setError('Введите email');
            return;
        }
        const userId = emailToId[email];
        if (!userId) {
            setError('Пользователь с таким email не найден');
            return;
        }
        if (chat.members.includes(userId)) {
            setError('Пользователь уже в чате');
            return;
        }
        onAddUser(userId);
        setNewUserEmail('');
        setError(null);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#242424',
            padding: 0,
            borderRadius: 10,
        }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <h3 style={{
                    fontWeight: 600,
                    fontSize: 22,
                    paddingLeft: 12,
                    margin: 0,
                    marginTop: 12,
                }}>
                    Участники чата
                </h3>
            </div>
            <ul style={{
                marginBottom: 16,
                padding: 0,
                flex: 1,
                overflowY: 'auto',
            }}>
                {chat.members.map(id => (
                    <li key={id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                            listStyle: 'none',
                            background: id === currentUserId ? 'rgba(142,45,226,0.10)' : 'none',
                            borderRadius: 5,
                            padding: '2px 12px',
                        }}>
                        <span style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {id === chat.owner_id ? "👑 " : ""}
                            {idToEmail[id] ? idToEmail[id] : `User with ID ${id}`}
                            {id === currentUserId ? " (вы)" : ""}
                        </span>
                        {isOwner && id !== chat.owner_id && id !== currentUserId && (
                            <button onClick={() => onRemoveUser(id)} style={{
                                marginLeft: 'auto',
                                background: "#8e2de2",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "3px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 15,
                                flexShrink: 0,
                            }}>✖︎</button>
                        )}
                    </li>
                ))}
            </ul>
            {isOwner && (
                <form onSubmit={handleAddUser}
                      style={{
                          display: 'flex',
                          gap: 0,
                          alignItems: 'center',
                          marginBottom: 8,
                          padding: '0 12px',
                      }}>
                    <input
                        type="email"
                        placeholder="Email пользователя"
                        value={newUserEmail}
                        onChange={e => {
                            setNewUserEmail(e.target.value);
                            setError(null);
                        }}
                        style={{
                            borderRadius: '5px 0 0 5px',
                            border: '1px solid #444',
                            background: '#181818',
                            color: 'white',
                            padding: '7px 12px',
                            fontSize: 15,
                            flex: 1,
                            minWidth: 0,
                            borderRight: 'none',
                        }}
                    />
                    <button type="submit" style={{
                        background: "#8e2de2",
                        color: "#fff",
                        border: "none",
                        borderRadius: '0 5px 5px 0',
                        padding: "7px 18px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 18,
                        marginLeft: 0,
                        flexShrink: 0,
                    }}>+
                    </button>
                    {/* Выводим ошибку внизу под формой */}
                </form>
            )}
            {isOwner && error && (
                <div style={{
                    color: "#ff5555",
                    fontSize: 14,
                    margin: "0 12px 10px 12px"
                }}>{error}</div>
            )}
        </div>
    );
};

export default ChatMembersPanel;

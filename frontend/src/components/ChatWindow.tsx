// src/components/ChatWindow.tsx
import React, {useRef, useState} from 'react';
import '@/css/ChatWindow.css';
import {useChats} from '@/hooks/useChats';
import {createChat, addUserToChat, removeUserFromChat} from '@/api/chatApi';
import ChatTitleMarquee from '@/components/ChatTitleMarquee';
import ChatMembersPanel from '@/components/ChatMembersPanel';
import {useCurrentUser} from '@/hooks/useCurrentUser';
import ChatPage from '@/pages/ChatPage';

type ResizeDimension = 'width' | 'height' | 'both';

interface ChatWindowProps {
    onClose: () => void;
    chatWidth: number;
    setChatWidth: (width: number) => void;
    isOpen: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({onClose, chatWidth, setChatWidth, isOpen}) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [chatName, setChatName] = useState('');
    const [chatDescription, setChatDescription] = useState('');
    const [newChatLoading, setNewChatLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {chats, loading: chatLoading, error: chatError, refreshChats} = useChats();
    const {user, loading: userLoading} = useCurrentUser();

    const handleResizeStart = (e: React.MouseEvent, dimension: ResizeDimension) => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = chatWidth;
        const doDrag = (moveEvent: MouseEvent) => {
            if (dimension === 'width' || dimension === 'both') {
                let newWidth = startWidth + (startX - moveEvent.clientX);
                if (newWidth < 300) newWidth = 300;
                setChatWidth(newWidth);
            }
        };
        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    const handleCreateChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatName.trim()) return alert('Введите название чата');
        setNewChatLoading(true);
        setErrorMessage(null);
        try {
            await createChat({name: chatName, description: chatDescription});
            setChatName('');
            setChatDescription('');
            setIsFormVisible(false);
            refreshChats();
        } catch (err) {
            setErrorMessage('Ошибка создания чата');
            console.error(err);
        } finally {
            setNewChatLoading(false);
        }
    };

    const [search, setSearch] = useState('');
    const filteredChats = chats.filter(
        (chat) =>
            chat.name.toLowerCase().includes(search.toLowerCase()) ||
            (chat.description && chat.description.toLowerCase().includes(search.toLowerCase()))
    );

    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div
            ref={windowRef}
            className={`chat-window${isOpen ? ' open' : ''}`}
            style={{
                width: `${chatWidth}px`,
                '--chat-width': `${chatWidth}px`,
            } as React.CSSProperties}
        >
            <div
                className="resize-handle resize-handle-left"
                onMouseDown={(e) => handleResizeStart(e, 'width')}
            />
            <div className="chat-content-scrollable">
                {activeChatId && activeChat ? (
                    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                        <div className="chat-window-header">
                            <button className="back-button" onClick={() => setActiveChatId(null)}
                                    title="Назад к списку">←
                            </button>
                            <div className="chat-title-marquee-container" style={{flex: 1}}>
                                <ChatTitleMarquee title={activeChat.name}/>
                            </div>
                            <button className="chat-members-btn" title="Участники чата"
                                    onClick={() => setShowMembers(v => !v)}>
                                👥
                            </button>
                        </div>
                        <div style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
                            {showMembers ? (
                                user && (
                                    <ChatMembersPanel
                                        chat={{
                                            ...activeChat,
                                            members: activeChat.members || []
                                        }}
                                        currentUserId={user.id}
                                        onAddUser={async (userId: number) => {
                                            await addUserToChat(activeChat.id, userId);
                                            await refreshChats();
                                        }}
                                        onRemoveUser={async (userId: number) => {
                                            await removeUserFromChat(activeChat.id, userId);
                                            await refreshChats();
                                        }}
                                        onClose={() => setShowMembers(false)}
                                    />
                                )
                            ) : userLoading ? (
                                <div style={{color: "#bbb", padding: 24}}>Загрузка профиля...</div>
                            ) : user ? (
                                <ChatPage chat={activeChat} userId={user.id}/>
                            ) : (
                                <div style={{color: "#f66", padding: 24}}>Ошибка загрузки пользователя</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="chat-new-chat" style={{marginTop: '20px'}}>
                            {!isFormVisible ? (
                                <button
                                    className="new-chat-button"
                                    onClick={() => setIsFormVisible(true)}
                                    disabled={newChatLoading}
                                >
                                    + Новый чат
                                </button>
                            ) : (
                                <form onSubmit={handleCreateChat} className="new-chat-form">
                                    <input
                                        type="text"
                                        placeholder="Название чата"
                                        value={chatName}
                                        onChange={e => setChatName(e.target.value)}
                                        className="new-chat-input"
                                        disabled={newChatLoading}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Описание"
                                        value={chatDescription}
                                        onChange={e => setChatDescription(e.target.value)}
                                        className="new-chat-input"
                                        disabled={newChatLoading}
                                    />
                                    <button
                                        type="submit"
                                        className="new-chat-submit"
                                        disabled={newChatLoading}
                                    >
                                        {newChatLoading ? 'Создание...' : 'Создать чат'}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setIsFormVisible(false)}
                                        disabled={newChatLoading}
                                    >
                                        Отмена
                                    </button>
                                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                                </form>
                            )}
                        </div>
                        <div className="chat-search">
                            <input
                                type="text"
                                placeholder="Поиск"
                                className="search-input"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="chat-categories">
                            <strong className="category-title">Сегодня</strong>
                            {chatLoading && <p className="empty-category">Загрузка чатов...</p>}
                            {!chatLoading && filteredChats.length === 0 && (
                                <p className="empty-category">Нет чатов</p>
                            )}
                            {!chatLoading &&
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className="chat-item chat-item-clickable"
                                        onClick={() => setActiveChatId(chat.id)}
                                    >
                                        <strong className="chat-name-fade">{chat.name}</strong>
                                        {chat.description && <p>{chat.description}</p>}
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;

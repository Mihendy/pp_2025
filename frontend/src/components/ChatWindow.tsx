import React, { useRef, useState } from 'react';
import '@/css/ChatWindow.css';
import { useCreateChat } from '@/hooks/useCreateChat';
import { useChats } from '@/hooks/useChats';
import { useAddUserToChat } from '@/hooks/useAddUserToChat';
import { createChat } from '@/api/chatApi';

type ResizeDimension = 'width' | 'height' | 'both';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 300, height: 400 });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [newChatLoading, setNewChatLoading] = useState(false);

  const { chats, loading: chatLoading, error: chatError, refreshChats } = useChats();
  const { loading: adding, error: addError, addUser: handleAddUser } = useAddUserToChat();

  // Ресайз окна
  const handleResizeStart = (e: React.MouseEvent, dimension: ResizeDimension) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const doDrag = (moveEvent: MouseEvent) => {
      let newWidth = size.width;
      let newHeight = size.height;

      if (dimension === 'width' || dimension === 'both') {
        newWidth = size.width + (startX - moveEvent.clientX);
        if (newWidth < 250) newWidth = 250;
      }

      if (dimension === 'height' || dimension === 'both') {
        newHeight = size.height - (startY - moveEvent.clientY);
        if (newHeight < 200) newHeight = 200;
      }

      setSize({
        width: newWidth,
        height: newHeight,
      });
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // Создание нового чата
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert('Введите email собеседника');

    setNewChatLoading(true);

    try {
      await createChat({ name: email }); // Предположим, что createChat импортирован
      setEmail('');
      setIsFormVisible(false);
      refreshChats(); // Обновляем список чатов
    } catch (err) {
      console.error('Ошибка создания чата:', err);
    } finally {
      setNewChatLoading(false);
    }
  };

  return (
    <div
      ref={windowRef}
      className="chat-window"
      style={{
        right: 0,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* Заголовок и крестик */}
      <header className="chat-window-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </header>

      {/* Форма создания нового чата */}
      <div className="chat-new-chat" style={{ marginTop: '20px' }}>
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
              type="email"
              placeholder="Введите email собеседника"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {addError && <p className="error-message">{addError}</p>}
          </form>
        )}
      </div>

      {/* Поиск */}
      <div className="chat-search">
        <input type="text" placeholder="Поиск" className="search-input" />
      </div>

      {/* Список чатов */}
      <div className="chat-categories">
        <strong className="category-title">Сегодня</strong>
        {chatLoading && <p className="empty-category">Загрузка чатов...</p>}
        {!chatLoading && chats.length === 0 && (
          <p className="empty-category">Нет чатов</p>
        )}

        {!chatLoading &&
          chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => handleAddUser(chat.id)}
            >
              <strong>{chat.name}</strong>
              {chat.description && <p>{chat.description}</p>}
            </div>
          ))}
      </div>

      {/* Хэндлеры изменения размера */}
      <div
        className="resize-handle resize-handle-left"
        onMouseDown={(e) => handleResizeStart(e, 'width')}
      />
      <div
        className="resize-handle resize-handle-bottom"
        onMouseDown={(e) => handleResizeStart(e, 'height')}
      />
      <div
        className="resize-handle resize-handle-corner"
        onMouseDown={(e) => handleResizeStart(e, 'both')}
      />
    </div>
  );
};

export default ChatWindow;
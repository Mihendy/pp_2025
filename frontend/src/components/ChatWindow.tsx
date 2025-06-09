// src/components/ChatWindow.tsx
import React, { useRef, useState } from 'react';
import '@/css/ChatWindow.css';

type ResizeDimension = 'width' | 'height' | 'both';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 300, height: 400 });

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
        newHeight = size.height - (startY - moveEvent.clientY); // Исправленная формула
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
      {/* Заголовок */}
      <header className="chat-window-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </header>

      {/* Форма создания нового чата */}
      <div className="chat-new-chat" style={{ marginTop: '20px' }}>
        <button className="new-chat-button">+ Новый чат</button>
      </div>

      {/* Поиск */}
      <div className="chat-search">
        <input type="text" placeholder="Поиск" className="search-input" />
      </div>

      {/* Сортировка по времени */}
      <div className="chat-categories">
        <strong className="category-title">Сегодня</strong>
        <p className="empty-category">Нет чатов</p>

        <strong className="category-title">Вчера</strong>
        <p className="empty-category">Нет чатов</p>

        <strong className="category-title">Предыдущие 7 дней</strong>
        <p className="empty-category">Нет чатов</p>
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
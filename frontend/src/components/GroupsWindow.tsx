// src/components/GroupsWindow.tsx

import React, { useRef, useState, useEffect } from 'react';
import '@/css/GroupsWindow.css';

// Хуки
import { useCreateGroup } from '@/hooks/useCreateGroup';
import { useCreatedGroups } from '@/hooks/useCreatedGroups';

type ResizeDimension = 'width' | 'height' | 'both';

interface Group {
  id: number;
  name: string;
  creator_id: number;
}

interface GroupsWindowProps {
  onClose: () => void;
  groupWidth: number;
  setGroupWidth: (width: number) => void;
  isOpen: boolean;
}

const GroupsWindow: React.FC<GroupsWindowProps> = ({
  onClose,
  groupWidth,
  setGroupWidth,
  isOpen,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(window.innerHeight);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newGroupLoading, setNewGroupLoading] = useState(false);

  // Получаем группы, созданные пользователем
  const { groups: createdGroups, refreshGroups: refreshCreatedGroups } = useCreatedGroups();
  const { onCreateGroup, loading: creating, error: createError } = useCreateGroup();

  // Проверяем, является ли пользователь создателем
  const userStringId = localStorage.getItem('user_id');
  const userId = userStringId ? parseInt(userStringId, 10) : -1;

  // Ресайз окна
  const handleResizeStart = (
    e: React.MouseEvent,
    dimension: ResizeDimension
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const doDrag = (moveEvent: MouseEvent) => {
      let newWidth = groupWidth;
      let newHeight = height;

      if (dimension === 'width' || dimension === 'both') {
        newWidth = groupWidth + (startX - moveEvent.clientX);
        if (newWidth < 250) newWidth = 250;
        setGroupWidth(newWidth);
      }

      if (dimension === 'height' || dimension === 'both') {
        newHeight = height - (startY - moveEvent.clientY);
        if (newHeight < 200) newHeight = 200;
        setHeight(newHeight);
      }
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // Выход по клику вне окна
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const groupWindow = document.querySelector('.groups-window');
      if (isOpen && groupWindow && !groupWindow.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isOpen]);

  // Вернуться к списку групп
  const goBack = () => {
    setSelectedGroup(null);
  };

  // Создание новой группы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return alert('Введите название группы');

    setNewGroupLoading(true);
    try {
      await onCreateGroup({ name: groupName });
      setGroupName('');
      setIsFormVisible(false);
      refreshCreatedGroups(); // Обновляем список после создания
    } catch (err) {
      console.error('Ошибка при создании группы:', err);
    } finally {
      setNewGroupLoading(false);
    }
  };

  return (
    <div
      ref={windowRef}
      className={`groups-window${isOpen ? ' open' : ''}`}
      style={{
        left: 0,
        width: `${groupWidth}px`,
        height: `${height}px`,
      }}
    >
      {/* Хэндлеры изменения размера */}
      <div
        className="resize-handle resize-handle-right"
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

      {/* Контент */}
      <div className="chat-content-scrollable">
        {!selectedGroup ? (
          <>
            {/* Форма создания группы */}
            <div className="chat-new-chat" style={{ marginTop: '20px' }}>
              {!isFormVisible ? (
                <button
                  className="new-chat-button"
                  onClick={() => setIsFormVisible(true)}
                  disabled={newGroupLoading}
                >
                  + Новая группа
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="new-chat-form">
                  <input
                    type="text"
                    placeholder="Название группы"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="new-chat-input"
                    disabled={newGroupLoading}
                  />
                  <button
                    type="submit"
                    className="new-chat-submit"
                    disabled={newGroupLoading}
                  >
                    {newGroupLoading ? 'Создание...' : 'Создать группу'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsFormVisible(false)}
                    disabled={newGroupLoading}
                  >
                    Отмена
                  </button>
                  {createError && <p className="error-message">{createError}</p>}
                </form>
              )}
            </div>

            {/* Поиск */}
            <div className="chat-search">
              <input
                type="text"
                placeholder="Поиск"
                className="search-input"
              />
            </div>

            {/* Список групп, где пользователь — создатель */}
            <div className="chat-categories">
              <strong className="category-title">Созданные мной</strong>
              {createdGroups.length === 0 ? (
                <p className="empty-category">Вы не создали ни одной группы</p>
              ) : (
                createdGroups.map((group) => (
                  <div
                    key={group.id}
                    className="chat-item"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <strong>{group.name}</strong>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          // Внутреннее окно группы
          <div className="group-details">
            <header className="group-details-header">
              <button className="back-button" onClick={goBack}>
                ←
              </button>
              <span>{selectedGroup.name}</span>
            </header>

            {/* Информация о создателе */}
            <div className="group-info">
              <small>Создатель: ID {selectedGroup.creator_id}</small>
            </div>

            {/* Список участников */}
            <div className="members-list">
              <h4>Участники:</h4>
              <ul>
                <li>Пока нет участников</li>
              </ul>
            </div>

            {/* Действия */}
            <footer className="group-footer">
              <button
                className="create-app-button"
                onClick={() => alert('Создание приглашения...')}
              >
                📝 Создать приглашение
              </button>

              {/* Кнопка "Удалить" появляется только если есть участники */}
              {false && (
                <button
                  className="delete-button"
                  onClick={() => alert('Удалить пользователя')}
                >
                  Удалить
                </button>
              )}

              <button className="leave-group-button" onClick={goBack}>
                ← Назад
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsWindow;
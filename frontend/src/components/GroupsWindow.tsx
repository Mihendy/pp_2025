import React, { useRef, useState, useEffect } from 'react';
import '@/css/GroupsWindow.css';

// Хуки
import { useCreatedGroups } from '@/hooks/useCreatedGroups';
import { useAllGroups } from '@/hooks/useAllGroups';
import { useCreateGroup } from '@/hooks/useCreateGroup';

type ResizeDimension = 'width' | 'height' | 'both';

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
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [newGroupLoading, setNewGroupLoading] = useState(false);

  // Получаем данные из хуков
  const { groups: createdGroups, loading: createdLoading, error: createdError, refreshGroups: refreshCreated } = useCreatedGroups();
  const { groups: allGroups, loading: allLoading, error: allError, refreshGroups: refreshAll } = useAllGroups();
  const { onCreateGroup, loading: creating, error: createError } = useCreateGroup();

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
        newWidth = groupWidth + (startX - moveEvent.clientX); // ← расширение вправо
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

  // Клик вне окна → закрытие
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

  // Форма создания новой группы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return alert('Введите название группы');

    setNewGroupLoading(true);
    try {
      await onCreateGroup({ name: groupName });
      setGroupName('');
      setIsFormVisible(false);
      refreshCreated(); // Обновляем список созданных
      refreshAll();     // и все группы
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
        '--group-width': `${groupWidth}px`,
        height: `${height}px`,
      } as React.CSSProperties}
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

              {(createdError || allError || createError) && (
                <p className="error-message">{createdError || allError || createError}</p>
              )}
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

        {/* Список созданных мной групп */}
        <div className="chat-categories">
          <strong className="category-title">Созданные мной</strong>
          {createdLoading && <p className="empty-category">Загрузка...</p>}
          {!createdLoading && createdGroups.length === 0 && (
            <p className="empty-category">Вы не создали ни одной группы</p>
          )}

          {!createdLoading &&
            createdGroups.map((group) => (
              <div key={group.id} className="chat-item">
                <strong>{group.name}</strong>
              </div>
            ))}
        </div>

        {/* Список всех доступных групп */}
        <div className="chat-categories" style={{ marginTop: '30px' }}>
          <strong className="category-title">Все группы</strong>
          {allLoading && <p className="empty-category">Загрузка всех групп...</p>}
          {!allLoading && allGroups.length === 0 && (
            <p className="empty-category">Групп нет</p>
          )}

          {!allLoading &&
            allGroups.map((group) => (
              <div key={group.id} className="chat-item">
                <strong>{group.name}</strong>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsWindow;
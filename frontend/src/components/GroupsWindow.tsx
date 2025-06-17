import React, { useRef, useState, useEffect } from 'react';
import '@/css/GroupsWindow.css';

// Хуки
import { useCreateGroup } from '@/hooks/useCreateGroup';
import { useCreatedGroups } from '@/hooks/useCreatedGroups';
import { useCreateInvite } from '@/hooks/useCreateInvite';

// Типы
import { Group } from '@/types/group.types';

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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [recipientId, setRecipientId] = useState<string>('');
  const [newGroupLoading, setNewGroupLoading] = useState(false);

  // Получаем список своих групп
  const { groups: createdGroups, refreshGroups: refreshCreatedGroups } = useCreatedGroups();
  const { onCreateGroup, loading: creating, error: createError } = useCreateGroup();
  const { createInvite, loading: inviting, error: inviteError } = useCreateInvite();

  // Проверяем ID текущего пользователя
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

  // Открытие внутреннего окна группы
  const openGroupDetails = (group: Group) => {
    setSelectedGroup(group);
  };

  // Создание новой группы
  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return alert('Введите название группы');

    setNewGroupLoading(true);
    try {
      await onCreateGroup({ name: groupName });
      setGroupName('');
      setIsFormVisible(false);
      refreshCreatedGroups(); // Обновляем список созданных групп
    } catch (err) {
      console.error('Ошибка создания группы:', err);
    } finally {
      setNewGroupLoading(false);
    }
  };

  // Отправка приглашения
  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId.trim()) return alert('Введите ID получателя');

    const recipient = parseInt(recipientId, 10);
    if (isNaN(recipient)) return alert('ID должен быть числом');

    if (!selectedGroup) return alert('Выберите группу');

    try {
      await createInvite({
        group_id: selectedGroup.id,
        sender_id: userId,
        recipient_id: recipient,
      });
      alert('Приглашение отправлено');
      setRecipientId('');
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
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
                <form onSubmit={handleSubmitGroup} className="new-chat-form">
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

            {/* Список групп, созданных пользователем */}
            <div className="chat-categories">
              <strong className="category-title">Созданные мной</strong>
              {createdGroups.length === 0 ? (
                <p className="empty-category">Вы не создали ни одной группы</p>
              ) : (
                createdGroups.map((group) => (
                  <div
                    key={group.id}
                    className="chat-item"
                    onClick={() => openGroupDetails(group)}
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
              <button className="back-button" onClick={() => setSelectedGroup(null)}>
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

            {/* Кнопка создания приглашения */}
            <div className="group-footer-above">
              <button
                className="create-invite-button"
                onClick={() => setShowInviteForm(true)}
              >
                📝 Создать приглашение
              </button>
            </div>
          </div>
        )}

        {/* Форма приглашения (показывается поверх контента) */}
        {showInviteForm && (
          <div className="invite-form-overlay">
            <form onSubmit={handleSubmitInvite} className="invite-form">
              <h4>Введите ID пользователя</h4>
              <input
                type="text"
                placeholder="ID получателя"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="new-chat-input"
                disabled={inviting}
              />
              <button
                type="submit"
                className="new-chat-submit"
                disabled={inviting}
              >
                {inviting ? 'Отправка...' : 'Отправить приглашение'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowInviteForm(false)}
                disabled={inviting}
              >
                Отмена
              </button>
              {inviteError && <p className="error-message">{inviteError}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsWindow;
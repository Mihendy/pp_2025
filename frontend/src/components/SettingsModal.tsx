// src/components/SettingsModal.tsx

import React from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  // Получаем access_token из localStorage
  const accessToken = localStorage.getItem('access_token');
  let userId = null;

  // Декодируем JWT токен для получения user_id
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      userId = payload.user_id || 'Не найден';
    } catch (e) {
      console.error('Ошибка декодирования токена', e);
      userId = 'Неверный токен';
    }
  }

  // Функция выхода
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');

      // Редирект на http://localhost/
      window.location.href = 'http://localhost/';
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <header className="settings-header">
          <h3>Настройки</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </header>

        <div className="settings-content">
          {/* Отображение ID пользователя */}
          <div className="setting-item">
            <label>Ваш ID:</label>
            <span>{userId !== null ? userId : 'Не авторизован'}</span>
          </div>

          {/* Кнопка выхода */}
          {userId && (
            <div className="setting-item">
              <button type="button" className="logout-button" onClick={handleLogout}>
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
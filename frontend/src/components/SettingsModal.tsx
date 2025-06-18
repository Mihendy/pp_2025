import React, {useEffect, useState} from 'react';

interface SettingsModalProps {
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SettingsModal: React.FC<SettingsModalProps> = ({onClose}) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setError('Нет access_token');
            return;
        }

        fetch(`${API_URL}/api/v1/users/me/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
            .then(async (resp) => {
                if (!resp.ok) throw new Error(await resp.text());
                return resp.json();
            })
            .then((data) => {
                setUserId(data.id?.toString());
                setEmail(data.email);
            })
            .catch((err) => setError('Ошибка авторизации'));
    }, []);

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
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
                    {error && (
                        <div className="setting-item" style={{color: 'red'}}>
                            {error}
                        </div>
                    )}
                    <div className="setting-item">
                        <label>Ваш ID:</label>
                        <span>{userId || '...'}</span>
                    </div>
                    {email && (
                        <div className="setting-item">
                            <label>Email:</label>
                            <span>{email}</span>
                        </div>
                    )}
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

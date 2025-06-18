// src/components/UserFilesModal.tsx

import React, {useEffect, useState} from 'react';
import {fetchAllUsers} from '@/api/userApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UserFile {
    BaseFileName: string;
    Size: number;
    OwnerId: number;
    UserId: number;
    Version: string;
    UserCanWrite: boolean;
    UserFriendlyName: string;
}

interface User {
    id: number;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    accessToken: string;
}

const UserFilesModal: React.FC<Props> = ({isOpen, onClose, accessToken}) => {
    const [files, setFiles] = useState<UserFile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);

        // Грузим список пользователей и файлов одновременно
        Promise.all([
            fetchAllUsers(),
            fetch(`${API_URL}/api/v1/wopi/files?access_token=${accessToken}`)
                .then(async (resp) => {
                    if (!resp.ok) throw new Error(await resp.text());
                    return resp.json();
                }),
        ])
            .then(([usersData, filesData]) => {
                setUsers(usersData);
                setFiles(filesData);
            })
            .catch((e) => setError(e.message || 'Ошибка загрузки'))
            .finally(() => setLoading(false));
    }, [isOpen, accessToken]);

    // Мапа id -> email
    const idToEmail = React.useMemo(() => {
        const map: Record<number, string> = {};
        users.forEach((u) => {
            map[u.id] = u.email;
        });
        return map;
    }, [users]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{minWidth: 420, maxWidth: 700}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
                    <h3 style={{margin: 0}}>Мои файлы</h3>
                    <button onClick={onClose} style={{
                        fontSize: 20,
                        background: 'none',
                        border: 'none',
                        color: '#8e2de2',
                        cursor: 'pointer'
                    }}>✖
                    </button>
                </div>
                {loading && <div>Загрузка...</div>}
                {error && <div style={{color: 'red'}}>{error}</div>}
                {!loading && !error && files.length === 0 && <div>Нет доступных файлов</div>}
                {!loading && !error && files.length > 0 && (
                    <table style={{width: '100%', color: 'white', fontSize: 15, borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{borderBottom: '1px solid #b36af7'}}>
                            <th style={{textAlign: 'left', padding: '6px 4px'}}>Путь</th>
                            <th style={{textAlign: 'right', padding: '6px 4px'}}>Размер</th>
                            <th style={{textAlign: 'center', padding: '6px 4px'}}>Владелец</th>
                            <th style={{textAlign: 'center', padding: '6px 4px'}}>Могу редактировать</th>
                        </tr>
                        </thead>
                        <tbody>
                        {files.map(f => (
                            <tr key={f.BaseFileName + f.OwnerId} style={{borderBottom: '1px solid #333'}}>
                                <td style={{padding: '6px 4px', fontFamily: 'monospace'}} title={f.BaseFileName}>
                                    {f.BaseFileName}
                                </td>
                                <td style={{padding: '6px 4px', textAlign: 'right'}}>
                                    {f.Size ? (f.Size / 1024).toFixed(1) + ' КБ' : '—'}
                                </td>
                                <td style={{padding: '6px 4px', textAlign: 'center'}}>
                                    {idToEmail[f.OwnerId] || f.OwnerId}
                                </td>
                                <td style={{padding: '6px 4px', textAlign: 'center'}}>
                                    {f.UserCanWrite ? '✅' : '🔒'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserFilesModal;

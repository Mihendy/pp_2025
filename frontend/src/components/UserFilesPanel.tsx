import React, {useEffect, useState} from 'react';
import {fetchAllUsers} from '@/api/userApi';
import FilePermissionsModal from './FilePermissionsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const FOOTER_HEIGHT = 72;

interface UserFile {
    BaseFileName: string;
    Size: number;
    OwnerId: number;
    UserId: number;
    Version: string;
    UserCanWrite: boolean;
    UserFriendlyName: string;
    FilePath: string;
}

interface User {
    id: number;
    email: string;
}

interface Props {
    visible: boolean;
    accessToken: string;
    currentUserId: number;
}

const UserFilesPanel: React.FC<Props> = ({visible, accessToken, currentUserId}) => {
    const [files, setFiles] = useState<UserFile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openFile, setOpenFile] = useState<string | null>(null);
    const [collaboraUrl, setCollaboraUrl] = useState<string | null>(null);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [permModalFile, setPermModalFile] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        setError(null);
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
    }, [visible, accessToken]);

    const idToEmail = React.useMemo(() => {
        const map: Record<number, string> = {};
        users.forEach((u) => {
            map[u.id] = u.email;
        });
        return map;
    }, [users]);

    const openInCollabora = async (filePath: string) => {
        if (openFile === filePath && collaboraUrl) return;
        setOpenFile(filePath);
        setCollaboraUrl(null);
        setIframeLoading(true);
        try {
            const resp = await fetch(
                `${API_URL}/get-collabora-url?file_path=${encodeURIComponent(filePath)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                }
            );
            if (!resp.ok) throw new Error(await resp.text());
            const data = await resp.json();
            if (data.url) {
                setCollaboraUrl(data.url);
            } else {
                setCollaboraUrl(null);
                alert('Collabora URL не получен');
            }
        } catch (e: any) {
            alert('Ошибка открытия файла: ' + (e?.message || e));
            setCollaboraUrl(null);
        } finally {
            setIframeLoading(false);
        }
    };

    const handleBack = () => {
        setOpenFile(null);
        setCollaboraUrl(null);
    };

    if (!visible) return null;

    return (
        <div
            className="user-files-panel"
            style={{
                background: 'rgba(28, 20, 43, 0.97)',
                boxShadow: '0 2px 18px 0 #0007',
                margin: 0,
                padding: 0,
                color: 'white',
                width: '100vw',
                maxWidth: '100vw',
                minWidth: 0,
                minHeight: `calc(100vh - ${FOOTER_HEIGHT}px)`,
                height: `calc(100vh - ${FOOTER_HEIGHT}px)`,
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Permissions modal */}
            {permModalFile && (
                <FilePermissionsModal
                    filePath={permModalFile}
                    accessToken={accessToken}
                    users={users}
                    idToEmail={idToEmail}
                    visible={!!permModalFile}
                    onClose={() => setPermModalFile(null)}
                    apiUrl={API_URL}
                />
            )}

            {/* Список файлов */}
            {(!openFile || !collaboraUrl) ? (
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '22px 32px 32px 32px',
                        minHeight: 0,
                        boxSizing: 'border-box'
                    }}
                >
                    <h3 style={{margin: '0 0 18px 0', color: '#b36af7', fontWeight: 700}}>Файлы</h3>
                    {loading && <div>Загрузка...</div>}
                    {error && <div style={{color: 'red'}}>{error}</div>}
                    {!loading && !error && files.length === 0 && <div>Нет доступных файлов</div>}
                    {!loading && !error && files.length > 0 && (
                        <div style={{width: '100%', overflowX: 'auto'}}>
                            <table
                                style={{
                                    width: '100%',
                                    minWidth: 650,
                                    color: 'white',
                                    fontSize: 15,
                                    borderCollapse: 'collapse',
                                }}
                            >
                                <thead>
                                <tr style={{borderBottom: '1px solid #b36af7'}}>
                                    <th style={{textAlign: 'left', padding: '6px 4px'}}>Путь</th>
                                    <th style={{textAlign: 'right', padding: '6px 4px'}}>Размер</th>
                                    <th style={{textAlign: 'center', padding: '6px 4px'}}>Владелец</th>
                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding: '6px 4px',
                                            position: 'sticky',
                                            right: 0,
                                            background: 'rgba(28, 20, 43, 0.97)',
                                            zIndex: 3,
                                            minWidth: 110,
                                            borderLeft: '1px solid #b36af7',
                                        }}
                                    >
                                        Могу редактировать / Права
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {files.map(f => (
                                    <tr
                                        key={f.FilePath + f.OwnerId}
                                        style={{
                                            borderBottom: '1px solid #333',
                                            opacity: openFile === f.FilePath && iframeLoading ? 0.55 : 1
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: '6px 4px',
                                                fontFamily: 'monospace',
                                                color: openFile === f.FilePath ? '#f1ddff' : '#c9b3fd',
                                                cursor: 'pointer'
                                            }}
                                            title="Открыть в Collabora"
                                            onClick={() => openInCollabora(f.FilePath)}
                                        >
                                            {openFile === f.FilePath && iframeLoading
                                                ? 'Открытие...'
                                                : f.FilePath}
                                        </td>
                                        <td style={{padding: '6px 4px', textAlign: 'right'}}>
                                            {f.Size ? (f.Size / 1024).toFixed(1) + ' КБ' : '—'}
                                        </td>
                                        <td style={{padding: '6px 4px', textAlign: 'center'}}>
                                            {idToEmail[f.OwnerId] || f.OwnerId}
                                        </td>
                                        <td
                                            style={{
                                                padding: '6px 4px',
                                                textAlign: 'center',
                                                position: 'sticky',
                                                right: 0,
                                                background: 'rgba(28, 20, 43, 0.97)',
                                                zIndex: 2,
                                                minWidth: 110,
                                                borderLeft: '1px solid #333',
                                            }}
                                        >
                                            {f.UserCanWrite ? '✅' : '🔒'}
                                            {f.OwnerId === currentUserId && (
                                                <button
                                                    style={{
                                                        marginLeft: 8,
                                                        padding: '2px 7px',
                                                        borderRadius: 6,
                                                        fontSize: 13,
                                                        background: '#333',
                                                        color: '#b36af7',
                                                        border: '1px solid #b36af7',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Управление правами"
                                                    onClick={() => setPermModalFile(f.FilePath)}
                                                >
                                                    Права
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div style={{color: "#aaa", fontSize: 12, marginTop: 8}}>
                        <span>Клик по пути файла — откроет его в Collabora прямо здесь</span>
                    </div>
                </div>
            ) : (
                // Collabora Editor
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minHeight: 0,
                        boxSizing: 'border-box',
                        padding: '22px 32px 32px 32px'
                    }}
                >
                    <button
                        className="back-button"
                        style={{
                            marginBottom: 18,
                            background: 'none',
                            border: 'none',
                            color: '#b36af7',
                            fontSize: 16,
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                        }}
                        onClick={handleBack}
                    >← Назад
                    </button>
                    <div
                        style={{
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '2px solid #b36af7',
                            background: '#18122b',
                            boxShadow: '0 2px 20px #b36af752',
                            width: '80%',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            margin: '0 auto',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{
                            padding: '7px 16px',
                            background: '#221d33',
                            color: '#e4e0f7',
                            fontWeight: 600,
                            fontSize: 16,
                        }}>
                            {openFile}
                        </div>
                        <iframe
                            src={collaboraUrl!}
                            title="Collabora Editor"
                            style={{
                                display: 'block',
                                width: '100%',
                                flex: 1,
                                height: '100%',
                                minHeight: 0,
                                border: 'none',
                                background: '#222',
                            }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFilesPanel;

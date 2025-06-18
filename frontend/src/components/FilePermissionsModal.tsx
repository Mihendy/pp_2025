import React, {useEffect, useState} from 'react';

interface FilePermission {
    user_id: number;
    rights_type: 'owner' | 'editor' | 'viewer';
    email?: string;
}

interface User {
    id: number;
    email: string;
}

interface Props {
    filePath: string;
    accessToken: string;
    users: User[];
    idToEmail: Record<number, string>;
    visible: boolean;
    onClose: () => void;
    apiUrl: string;
}

const FilePermissionsModal: React.FC<Props> = ({
                                                   filePath, accessToken, users, idToEmail, visible, onClose, apiUrl
                                               }) => {
    const [permissions, setPermissions] = useState<FilePermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [grantUser, setGrantUser] = useState('');
    const [grantType, setGrantType] = useState<'editor' | 'viewer'>('editor');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        setError(null);
        fetch(`${apiUrl}/api/v1/rights?file_path=${encodeURIComponent(filePath)}`, {
            headers: {'Authorization': `Bearer ${accessToken}`},
        })
            .then(async (resp) => {
                if (!resp.ok) throw new Error(await resp.text());
                const perms = await resp.json();
                setPermissions(
                    perms.map((p: FilePermission) => ({
                        ...p,
                        email: idToEmail[p.user_id] || String(p.user_id),
                    }))
                );
            })
            .catch((e) => setError(e?.message || 'Ошибка загрузки прав'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line
    }, [filePath, visible]);

    // Выдать права
    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setError(null);
        try {
            const user = users.find(
                u => u.email === grantUser || String(u.id) === grantUser
            );
            if (!user) {
                setError('Пользователь не найден');
                setActionLoading(false);
                return;
            }
            const body = {
                file_path: filePath,
                user_id: user.id,
                rights_type: grantType,
            };
            const resp = await fetch(`${apiUrl}/api/v1/rights/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
            });
            if (!resp.ok) throw new Error(await resp.text());
            // Обновить список прав
            const updated = await fetch(`${apiUrl}/api/v1/rights?file_path=${encodeURIComponent(filePath)}`, {
                headers: {'Authorization': `Bearer ${accessToken}`},
            });
            setPermissions(
                (await updated.json()).map((p: FilePermission) => ({
                    ...p,
                    email: idToEmail[p.user_id] || String(p.user_id),
                }))
            );
            setGrantUser('');
            setGrantType('editor');
        } catch (e: any) {
            setError(e?.message || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    // Отозвать права
    const handleRevoke = async (user_id: number) => {
        setActionLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${apiUrl}/api/v1/rights/${encodeURIComponent(filePath)}/${user_id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${accessToken}`},
            });
            if (!resp.ok) throw new Error(await resp.text());
            setPermissions(permissions.filter((p) => p.user_id !== user_id));
        } catch (e: any) {
            setError(e?.message || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#242145',
                color: '#fff',
                padding: 32,
                borderRadius: 14,
                minWidth: 360,
                maxWidth: '90vw',
                width: 420,
                boxShadow: '0 4px 32px #000a',
                position: 'relative',
            }}>
                <button
                    style={{
                        position: 'absolute',
                        top: 12, right: 18,
                        fontSize: 24,
                        background: 'none',
                        border: 'none',
                        color: '#b36af7',
                        cursor: 'pointer',
                        zIndex: 10,
                    }}
                    onClick={onClose}
                    aria-label="Закрыть"
                >×
                </button>
                <h2 style={{margin: 0, color: '#b36af7', fontWeight: 700, fontSize: 22, marginBottom: 12}}>
                    Доступы к файлу
                </h2>
                <div style={{fontSize: 13, marginBottom: 12, color: "#aaa"}}>{filePath}</div>
                {loading ? <div>Загрузка...</div> : (
                    <>
                        <ul style={{margin: '8px 0 8px 0', padding: 0, listStyle: 'none', minHeight: 52}}>
                            {permissions.map((perm) => (
                                <li key={perm.user_id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '3px 0'
                                    }}>
                                    <span>
                                        {perm.email} — {perm.rights_type}
                                    </span>
                                    {perm.rights_type !== 'owner' && (
                                        <button
                                            style={{
                                                background: 'none',
                                                color: '#e66060',
                                                border: 'none',
                                                fontSize: 17,
                                                cursor: 'pointer'
                                            }}
                                            title="Удалить доступ"
                                            onClick={() => handleRevoke(perm.user_id)}
                                            disabled={actionLoading}
                                        >✖</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleGrant} style={{display: 'flex', gap: 10, marginTop: 18}}>
                            <input
                                type="text"
                                value={grantUser}
                                onChange={e => setGrantUser(e.target.value)}
                                placeholder="Email или ID"
                                style={{
                                    flex: 1,
                                    borderRadius: 5,
                                    padding: '4px 10px',
                                    border: '1px solid #555',
                                    background: '#18122b',
                                    color: '#fff'
                                }}
                                disabled={actionLoading}
                                required
                            />
                            <select
                                value={grantType}
                                onChange={e => setGrantType(e.target.value as any)}
                                style={{
                                    borderRadius: 5,
                                    padding: '4px 8px',
                                    border: '1px solid #555',
                                    background: '#18122b',
                                    color: '#fff'
                                }}
                                disabled={actionLoading}
                            >
                                <option value="editor">Редактор</option>
                                <option value="viewer">Только просмотр</option>
                            </select>
                            <button
                                type="submit"
                                style={{
                                    borderRadius: 5,
                                    padding: '4px 16px',
                                    background: '#b36af7',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                                disabled={actionLoading}
                            >Выдать
                            </button>
                        </form>
                        {error && <div style={{color: "red", marginTop: 10}}>{error}</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default FilePermissionsModal;

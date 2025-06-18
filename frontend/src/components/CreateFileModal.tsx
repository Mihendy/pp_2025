import React, {useState} from 'react';

interface CreateFileModalProps {
    groupId: number;
    accessToken: string;
    onClose: () => void;
    onFileCreated?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CreateFileModal: React.FC<CreateFileModalProps> = ({
                                                             groupId,
                                                             accessToken,
                                                             onClose,
                                                             onFileCreated
                                                         }) => {
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!fileName.trim()) {
            setError('Введите имя файла');
            return;
        }
        const filePath = `${groupId}/${fileName.trim()}`;

        setLoading(true);
        try {
            // Получаем список файлов пользователя (можно переделать на ручку получения только файлов этой группы)
            const resp = await fetch(`${API_URL}/api/v1/wopi/files?access_token=${accessToken}`);
            if (!resp.ok) throw new Error(await resp.text());
            const files = await resp.json();
            if (files.some((f: any) => f.BaseFileName === filePath)) {
                setError('Файл с таким именем уже существует в этой группе');
                setLoading(false);
                return;
            }

            // Создаём файл
            const createResp = await fetch(
                `${API_URL}/api/v1/wopi/files/${encodeURIComponent(filePath)}?access_token=${accessToken}`,
                {method: 'POST'}
            );
            if (!createResp.ok) throw new Error(await createResp.text());
            setSuccess(true);
            setFileName('');
            if (onFileCreated) onFileCreated();
        } catch (err: any) {
            setError(err?.message || 'Ошибка создания файла');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.45)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    background: '#18122b',
                    padding: 32,
                    borderRadius: 16,
                    minWidth: 340,
                    boxShadow: '0 4px 24px #000b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, color: '#b36af7', fontWeight: 600}}>Создать файл в группе</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', fontSize: 28,
                            color: '#b36af7', cursor: 'pointer', marginLeft: 10
                        }}
                        tabIndex={-1}
                    >×
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Имя файла (например, plan.docx)"
                    value={fileName}
                    onChange={e => {
                        setFileName(e.target.value);
                        setError(null);
                        setSuccess(false);
                    }}
                    className="new-chat-input"
                    disabled={loading}
                />
                <button
                    className="new-chat-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Создание..." : "Создать файл"}
                </button>
                {error && <div style={{color: "red", fontSize: 13}}>{error}</div>}
                {success && <div style={{color: "lime", fontSize: 13}}>Файл создан!</div>}
            </form>
        </div>
    );
};

export default CreateFileModal;

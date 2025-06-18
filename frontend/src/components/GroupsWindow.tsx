import React, {useState, useEffect} from 'react';
import '@/css/ChatWindow.css';
import {useCreateGroup} from '@/hooks/useCreateGroup';
import {useCreatedGroups} from '@/hooks/useCreatedGroups';
import {useCreateInvite} from '@/hooks/useCreateInvite';
import {useGetMemberGroups} from '@/hooks/useGetMemberGroups';
import {useGetPendingInvites} from '@/hooks/useGetPendingInvites';
import {useAcceptInvite} from '@/hooks/useAcceptInvite';
import {useDeclineInvite} from '@/hooks/useDeclineInvite';
import {Group} from '@/types/group.types';
import {InviteResponse} from '@/types/invite.types';
import {fetchAllUsers} from '@/api/userApi';

const FIXED_WIDTH = 300;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiGroup {
    id: number;
    name: string;
    creator_id: number;
    members: number[]; // ids
}

interface GroupsWindowProps {
    onClose: () => void;
    isOpen: boolean;
}

const GroupsWindow: React.FC<GroupsWindowProps> = ({
                                                       onClose,
                                                       isOpen,
                                                   }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [recipientId, setRecipientId] = useState<string>('');
    const [newGroupLoading, setNewGroupLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Загружаем всех пользователей для email
    const [users, setUsers] = useState<{ id: number, email: string }[]>([]);
    useEffect(() => {
        fetchAllUsers().then(setUsers);
    }, []);
    const idToEmail = React.useMemo(() => {
        const map: Record<number, string> = {};
        users.forEach(u => {
            map[u.id] = u.email;
        });
        return map;
    }, [users]);

    // Грузим все группы (для участников)
    const [allGroups, setAllGroups] = useState<ApiGroup[]>([]);
    useEffect(() => {
        fetch(`${API_URL}/api/v1/groups/all/`)
            .then(resp => resp.json())
            .then(setAllGroups)
            .catch(() => setAllGroups([]));
    }, []);

    // Группы/инвайты (текущего пользователя)
    const {
        groups: createdGroups,
        refreshGroups: refreshCreatedGroups,
        loading: loadingCreatedGroups,
        error: createError,
    } = useCreatedGroups();
    const {onCreateGroup, loading: creating, error: createGroupError} = useCreateGroup();
    const {createInvite, loading: inviting, error: inviteError} = useCreateInvite();
    const {
        groups: memberGroups,
        loading: loadingMemberGroups,
        error: memberGroupsError,
        refreshGroups: refreshMemberGroups,
    } = useGetMemberGroups();
    const {
        invites: pendingInvites,
        loading: loadingInvites,
        error: inviteListError,
        refreshInvites,
    } = useGetPendingInvites();
    const {acceptInvite, loading: accepting, error: acceptError} = useAcceptInvite();
    const {declineInvite, loading: declining, error: declineError} = useDeclineInvite();

    const userStringId = localStorage.getItem('user_id');
    const userId = userStringId ? parseInt(userStringId, 10) : -1;

    // Клик вне окна закрывает его
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

    // Создать группу
    const handleSubmitGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!groupName.trim()) {
            setFormError('Введите название группы');
            return;
        }
        setNewGroupLoading(true);
        try {
            await onCreateGroup({name: groupName});
            setGroupName('');
            setIsFormVisible(false);
            refreshCreatedGroups();
        } catch (err: any) {
            setFormError(err?.message || 'Ошибка создания группы');
        } finally {
            setNewGroupLoading(false);
        }
    };

    // Пригласить
    const handleSubmitInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!recipientId.trim()) {
            setFormError('Введите ID получателя');
            return;
        }
        const recipient = parseInt(recipientId, 10);
        if (isNaN(recipient)) {
            setFormError('ID должен быть числом');
            return;
        }
        if (!selectedGroup) {
            setFormError('Выберите группу');
            return;
        }
        try {
            await createInvite({
                group_id: selectedGroup.id,
                sender_id: userId,
                recipient_id: recipient,
            });
            setRecipientId('');
            setShowInviteForm(false);
        } catch (err: any) {
            setFormError(err?.message || 'Ошибка приглашения');
        }
    };

    // Принять приглашение
    const handleAccept = async (invite: InviteResponse) => {
        try {
            await acceptInvite(invite.id);
            refreshInvites();
            refreshMemberGroups();
        } catch {
        }
    };

    // Отклонить приглашение
    const handleDecline = async (invite: InviteResponse) => {
        try {
            await declineInvite(invite.id);
            refreshInvites();
        } catch {
        }
    };

    // Получить участников для выбранной группы (selectedGroup)
    const currentApiGroup = allGroups.find(g => g.id === selectedGroup?.id);

    return (
        <div
            className={`chat-window groups-window${isOpen ? ' open' : ''}`}
            style={{
                left: 0,
                width: `${FIXED_WIDTH}px`,
                height: '100vh',
                borderRight: '1px solid rgba(255,255,255,0.17)',
                borderRadius: '0px',
                background: '#242424',
                color: '#fff',
                position: 'fixed',
                top: 0,
                zIndex: 1001,
                transition: 'box-shadow 0.2s',
                boxShadow: isOpen ? '2px 0 20px #0008' : 'none',
            }}
        >
            <div className="chat-content-scrollable">
                {!selectedGroup ? (
                    <>
                        <div className="chat-new-chat" style={{marginTop: 20}}>
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
                                    {(createGroupError || createError || formError) && (
                                        <p className="error-message">{formError || createGroupError || createError}</p>
                                    )}
                                </form>
                            )}
                        </div>
                        <div className="chat-new-chat">
                            <button
                                className="new-chat-button"
                                onClick={() =>
                                    setSelectedGroup({id: -1, name: 'Мои приглашения', creator_id: userId})
                                }
                            >
                                📬 Мои приглашения
                            </button>
                        </div>
                        <div className="chat-new-chat">
                            <button
                                className="new-chat-button"
                                onClick={() =>
                                    setSelectedGroup({
                                        id: -2,
                                        name: 'Группы, в которых вы состоите',
                                        creator_id: userId,
                                    })
                                }
                            >
                                👥 В составе
                            </button>
                        </div>
                        <div className="chat-search">
                            <input type="text" placeholder="Поиск" className="search-input"/>
                        </div>
                        <div className="chat-categories">
                            <strong className="category-title">Созданные мной</strong>
                            {loadingCreatedGroups && <p className="empty-category">Загрузка...</p>}
                            {createdGroups.length === 0 && !loadingCreatedGroups && (
                                <p className="empty-category">Вы не создали ни одной группы</p>
                            )}
                            {!loadingCreatedGroups &&
                                createdGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="chat-item chat-item-clickable"
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <strong className="chat-name-fade">{group.name}</strong>
                                    </div>
                                ))}
                        </div>
                    </>
                ) : selectedGroup.id === -1 ? (
                    <div className="group-details" style={{padding: 16}}>
                        <header className="group-details-header"
                                style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            <button className="back-button" onClick={() => setSelectedGroup(null)}>←</button>
                            <span style={{fontSize: 19, fontWeight: 600}}>{selectedGroup.name}</span>
                        </header>
                        <div className="invites-list">
                            <h4>Входящие приглашения:</h4>
                            {loadingInvites && <p className="empty-category">Загрузка...</p>}
                            {(inviteListError || acceptError || declineError) && (
                                <p className="error-message">
                                    {inviteListError || acceptError || declineError}
                                </p>
                            )}
                            {!loadingInvites && pendingInvites.length === 0 && (
                                <p className="empty-category">Нет входящих приглашений</p>
                            )}
                            {!loadingInvites &&
                                pendingInvites.map((invite) => (
                                    <div key={invite.id} className="chat-item"
                                         style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <div>
                                            <strong>Группа: {invite.group_id}</strong>
                                            <small style={{marginLeft: 7, color: "#aaa"}}>
                                                Инициировал: {idToEmail[invite.sender_id] || invite.sender_id}
                                            </small>
                                        </div>
                                        <div>
                                            <small style={{color: "#aaa"}}>
                                                Приглашён: {idToEmail[invite.recipient_id] || invite.recipient_id}
                                            </small>
                                        </div>
                                        <div style={{display: 'flex', gap: 12, marginTop: 6}}>
                                            <button
                                                className="new-chat-submit"
                                                onClick={() => handleAccept(invite)}
                                                disabled={accepting || declining}
                                                style={{minWidth: 90}}
                                            >
                                                ✅ Принять
                                            </button>
                                            <button
                                                className="cancel-button"
                                                onClick={() => handleDecline(invite)}
                                                disabled={accepting || declining}
                                                style={{minWidth: 90}}
                                            >
                                                ❌ Отклонить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : selectedGroup.id === -2 ? (
                    <div className="group-details" style={{padding: 16}}>
                        <header className="group-details-header"
                                style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            <button className="back-button" onClick={() => setSelectedGroup(null)}>←</button>
                            <span style={{fontSize: 19, fontWeight: 600}}>{selectedGroup.name}</span>
                        </header>
                        <div className="member-groups-list">
                            <h4>Вы состоите в следующих группах:</h4>
                            {loadingMemberGroups && <p className="empty-category">Загрузка...</p>}
                            {memberGroupsError && <p className="error-message">{memberGroupsError}</p>}
                            {!loadingMemberGroups && memberGroups.length === 0 && (
                                <p className="empty-category">Вы не состоите ни в одной группе</p>
                            )}
                            {!loadingMemberGroups &&
                                memberGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="chat-item chat-item-clickable"
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <strong className="chat-name-fade">{group.name}</strong>
                                        <small>Создатель: {idToEmail[group.creator_id] || group.creator_id}</small>
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="group-details" style={{padding: 16}}>
                        <header className="group-details-header"
                                style={{display: 'flex', alignItems: 'center', gap: 12}}>
                            <button className="back-button" onClick={() => setSelectedGroup(null)}>←</button>
                            <span style={{fontSize: 19, fontWeight: 600}}>{selectedGroup?.name}</span>
                        </header>
                        <div className="group-info" style={{margin: '10px 0 20px 0'}}>
                            <small>Создатель: {idToEmail[selectedGroup?.creator_id || 0] || selectedGroup?.creator_id}</small>
                        </div>

                        {/* Список участников */}
                        <div style={{marginBottom: 18}}>
                            <strong style={{fontSize: 15, color: "#b36af7"}}>Участники группы:</strong>
                            {!currentApiGroup && <div className="empty-category">Нет данных о группе</div>}
                            {currentApiGroup && currentApiGroup.members.length === 0 && (
                                <div className="empty-category">В группе пока никого нет</div>
                            )}
                            {currentApiGroup && currentApiGroup.members.length > 0 && (
                                <ul style={{margin: "8px 0 0 0", padding: 0, listStyle: "none"}}>
                                    {currentApiGroup.members.map((id) => (
                                        <li key={id} style={{
                                            padding: "4px 0",
                                            fontSize: 15,
                                            color: "#fff",
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <span>{idToEmail[id] || id}</span>
                                            {id === currentApiGroup.creator_id && (
                                                <span
                                                    style={{marginLeft: 8, color: '#b36af7', fontSize: 13}}>owner</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <button
                                className="new-chat-button"
                                onClick={() => setShowInviteForm(true)}
                                style={{minWidth: 180, fontSize: 15}}
                            >
                                📝 Создать приглашение
                            </button>
                        </div>
                    </div>
                )}
                {/* Модалка приглашения */}
                {showInviteForm && (
                    <div className="invite-form-overlay" style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.35)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <form onSubmit={handleSubmitInvite} className="invite-form" style={{
                            background: '#18122b',
                            padding: 28,
                            borderRadius: 16,
                            minWidth: 340,
                            boxShadow: '0 4px 24px #000b',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                        }}>
                            <h4>Введите ID пользователя</h4>
                            <input
                                type="text"
                                placeholder="ID получателя"
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                className="new-chat-input"
                                disabled={inviting}
                                style={{fontSize: 17}}
                            />
                            <div style={{display: 'flex', gap: 12}}>
                                <button
                                    type="submit"
                                    className="new-chat-submit"
                                    disabled={inviting}
                                    style={{minWidth: 120}}
                                >
                                    {inviting ? 'Отправка...' : 'Отправить приглашение'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowInviteForm(false)}
                                    disabled={inviting}
                                    style={{minWidth: 120}}
                                >
                                    Отмена
                                </button>
                            </div>
                            {(inviteError || formError) && <p className="error-message">{formError || inviteError}</p>}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupsWindow;

interface GroupsWindowProps {
  onClose: () => void;
  groupWidth: number;
  setGroupWidth: (width: number) => void;
  isOpen: boolean;
}
import { useState } from 'react';
import { removeUserFromGroup as apiRemoveUserFromGroup } from '@/api/groupApi';

interface UseRemoveUserFromGroupResult {
  removeUser: (groupId: number, userId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useRemoveUserFromGroup = (): UseRemoveUserFromGroupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeUser = async (groupId: number, userId: number): Promise<void> => {
    if (!window.confirm('Удалить этого пользователя?')) return;

    setLoading(true);
    setError(null);

    try {
      await apiRemoveUserFromGroup(groupId, userId);
      alert('Пользователь удален');
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении');
    } finally {
      setLoading(false);
    }
  };

  return { removeUser, loading, error };
};
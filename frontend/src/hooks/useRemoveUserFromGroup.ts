import { useState } from 'react';
import { removeUserFromGroup as apiRemoveUserFromGroup } from '@/api/groupApi';

export const useRemoveUserFromGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeUser = async (groupId: number, userId: number) => {
    setLoading(true);
    setError(null);

    try {
      await apiRemoveUserFromGroup(groupId, userId);
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении пользователя');
    } finally {
      setLoading(false);
    }
  };

  return { removeUser, loading, error };
};
import { useEffect, useState } from 'react';
import { getGroupMembers as apiGetGroupMembers } from '@/api/groupApi';

interface UseGetGroupMembersResult {
  members: { id: number; username: string }[];
  loading: boolean;
  error: string | null;
  refreshMembers: () => void;
}

export const useGetGroupMembers = (groupId: number | null): UseGetGroupMembersResult => {
  const [members, setMembers] = useState<{ id: number; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiGetGroupMembers(groupId);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке участников');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId !== null) {
      loadMembers();
    }
  }, [groupId]);

  return { members, loading, error, refreshMembers: loadMembers };
};
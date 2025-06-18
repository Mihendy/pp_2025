import { useEffect, useState } from 'react';
import { getGroupById } from '@/api/groupApi';
import { GroupResponse } from '@/types/group.types';

interface UseGetGroupDetailsResult {
  group: GroupResponse | null;
  loading: boolean;
  error: string | null;
  refreshGroup: () => void;
}

export const useGetGroupDetails = (groupId: number | null): UseGetGroupDetailsResult => {
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getGroupById(groupId);
      setGroup(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке группы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId !== null) {
      loadGroup();
    }
  }, [groupId]);

  return { group, loading, error, refreshGroup: loadGroup };
};
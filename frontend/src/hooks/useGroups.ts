import { useEffect, useState } from 'react';
import { getGroups } from '@/api/groupApi';
import { GroupResponse } from '@/types/group.types';

interface UseGroupsResult {
  groups: GroupResponse[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => void;
}

export const useGroups = (): UseGroupsResult => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить группы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refreshGroups: loadGroups,
  };
};
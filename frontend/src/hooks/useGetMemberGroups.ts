import { useEffect, useState } from 'react';
import { getMemberGroups } from '@/api/groupApi';
import { GroupMemberResponse } from '@/types/group.types';

interface UseGetMemberGroupsResult {
  groups: GroupMemberResponse[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => void;
}

export const useGetMemberGroups = (): UseGetMemberGroupsResult => {
  const [groups, setGroups] = useState<GroupMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMemberGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке групп');
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
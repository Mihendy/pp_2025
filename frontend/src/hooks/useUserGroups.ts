// src/hooks/useUserGroups.ts

import { useEffect, useState } from 'react';
import { getUserGroups as apiGetUserGroups } from '@/api/groupApi';
import { GroupResponse } from '@/types/group.types';

interface UseUserGroupsResult {
  groups: GroupResponse[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => void;
}

export const useUserGroups = (): UseUserGroupsResult => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGetUserGroups();
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
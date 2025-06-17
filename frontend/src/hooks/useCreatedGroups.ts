// src/hooks/useCreatedGroups.ts

import { useEffect, useState } from 'react';
import { getCreatedGroups as apiGetCreatedGroups } from '@/api/groupApi';
import { GroupResponse } from '@/types/group.types';

interface UseCreatedGroupsResult {
  groups: GroupResponse[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => void;
}

export const useCreatedGroups = (): UseCreatedGroupsResult => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await apiGetCreatedGroups();
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
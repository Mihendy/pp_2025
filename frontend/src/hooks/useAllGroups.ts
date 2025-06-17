// src/hooks/useAllGroups.ts

import { useEffect, useState } from 'react';
import { getAllGroups as apiGetAllGroups } from '@/api/groupApi';
import { GroupResponse } from '@/types/group.types';

interface UseAllGroupsResult {
  groups: GroupResponse[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => void;
}

export const useAllGroups = (): UseAllGroupsResult => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await apiGetAllGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке всех групп');
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
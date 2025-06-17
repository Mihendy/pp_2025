// src/hooks/useGroups.ts

import { useEffect, useState } from 'react';
import { GroupResponse } from '@/types/group.types';

const API_URL = 'http://localhost:8000'; // или VITE_API_URL из .env

export const useGroups = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/groups/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Не удалось загрузить группы');

      const data = await response.json();
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
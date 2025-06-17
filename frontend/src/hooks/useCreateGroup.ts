// src/hooks/useCreateGroup.ts

import { useState } from 'react';
import { GroupRequest, GroupResponse } from '@/types/group.types';

const API_URL = 'http://localhost:8000'; // или VITE_API_URL

export const useCreateGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (data: GroupRequest): Promise<GroupResponse> => {
    const accessToken = localStorage.getItem('access_token');

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/groups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось создать группу');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании группы');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, loading, error };
};
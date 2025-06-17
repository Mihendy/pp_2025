// src/hooks/useAddUserToGroup.ts

import { useState } from 'react';

const API_URL = 'http://localhost:8000'; // или VITE_API_URL

export const useAddUserToGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUser = async (groupId: number): Promise<void> => {
    const accessToken = localStorage.getItem('access_token');

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось добавить вас в группу');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении в группу');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addUser, loading, error };
};
import { useState } from 'react';
import { createGroup as apiCreateGroup } from '@/api/groupApi';

// Типы
interface GroupRequest {
  name: string;
}

interface UseCreateGroupResult {
  loading: boolean;
  error: string | null;
  onCreateGroup: (data: GroupRequest) => Promise<void>;
}

export const useCreateGroup = (): UseCreateGroupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreateGroup = async (data: GroupRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await apiCreateGroup(data); // Вызываем API
    } catch (err: any) {
      setError(err.message || 'Не удалось создать группу');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    onCreateGroup, // ✅ Теперь это доступно
  };
};
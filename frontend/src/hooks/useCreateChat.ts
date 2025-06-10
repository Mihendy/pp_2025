import { useState } from 'react';
import { createChat } from '@/api/chatApi';

export const useCreateChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateChat = async (data: { name: string; description: string }) => {
    setLoading(true);
    setError(null);

    try {
      const chat = await createChat(data);
      setLoading(false);
      return chat;
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании чата');
      setLoading(false);
      return null;
    }
  };

  return { loading, error, onCreateChat: handleCreateChat };
};

// src/hooks/useAddUserToChat.ts
import { useState } from 'react';
import { addUserToChat } from '@/api/chatApi';

export const useAddUserToChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUserToChat = async (chatId: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await addUserToChat(chatId);
      console.log('✅ Пользователь добавлен:', result.message);
    } catch (err: any) {
      console.error('❌ Ошибка при добавлении пользователя:', err.message);
      setError(err.message || 'Ошибка добавления в чат');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, addUser: handleAddUserToChat };
};
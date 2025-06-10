import { useEffect, useState } from 'react';
import { getChats } from '@/api/chatApi';
import { ChatResponse } from '@/types/chat.types';

interface UseChatsResult {
  chats: ChatResponse[];
  loading: boolean;
  error: string | null;
  refreshChats: () => void;
}

export const useChats = (): UseChatsResult => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await getChats();
      setChats(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке чатов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return {
    chats,
    loading,
    error,
    refreshChats: loadChats,
  };
};
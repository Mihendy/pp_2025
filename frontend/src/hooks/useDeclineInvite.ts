import { useState } from 'react';
import { declineInvite as apiDeclineInvite } from '@/api/inviteApi';

interface UseDeclineInviteResult {
  declineInvite: (inviteId: number) => Promise<{ detail: string }>;
  loading: boolean;
  error: string | null;
}

export const useDeclineInvite = (): UseDeclineInviteResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const declineInvite = async (inviteId: number): Promise<{ detail: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiDeclineInvite(inviteId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка при отклонении приглашения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    declineInvite,
    loading,
    error,
  };
};
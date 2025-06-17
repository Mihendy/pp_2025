import { useState } from 'react';
import { createInvite as apiCreateInvite } from '@/api/inviteApi';
import { InviteRequest, InviteResponse } from '@/types/invite.types';

interface UseCreateInviteResult {
  createInvite: (data: InviteRequest) => Promise<InviteResponse>;
  loading: boolean;
  error: string | null;
}

export const useCreateInvite = (): UseCreateInviteResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvite = async (data: InviteRequest): Promise<InviteResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCreateInvite(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке приглашения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvite,
    loading,
    error,
  };
};
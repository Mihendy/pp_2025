import { useState } from 'react';
import { acceptInvite as apiAcceptInvite } from '@/api/inviteApi';
import { InviteResponse } from '@/types/invite.types';

interface UseAcceptInviteResult {
  acceptInvite: (inviteId: number) => Promise<InviteResponse>;
  loading: boolean;
  error: string | null;
}

export const useAcceptInvite = (): UseAcceptInviteResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptInvite = async (inviteId: number): Promise<InviteResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiAcceptInvite(inviteId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка при принятии приглашения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptInvite,
    loading,
    error,
  };
};
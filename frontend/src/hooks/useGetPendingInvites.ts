import { useEffect, useState } from 'react';
import { getPendingInvites } from '@/api/inviteApi';
import { InviteResponse } from '@/types/invite.types';

interface UseGetPendingInvitesResult {
  invites: InviteResponse[];
  loading: boolean;
  error: string | null;
  refreshInvites: () => void;
}

export const useGetPendingInvites = (): UseGetPendingInvitesResult => {
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvites = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPendingInvites();
      setInvites(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке приглашений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  return { invites, loading, error, refreshInvites: loadInvites };
};
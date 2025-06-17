import { InviteRequest, InviteResponse } from '@/types/invite.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const createInvite = async (data: InviteRequest): Promise<InviteResponse> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/invites/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось отправить приглашение');
  }

  return await response.json();
};
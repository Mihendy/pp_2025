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

// Получить все входящие приглашения
export const getPendingInvites = async (): Promise<InviteResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/invites/pending`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить приглашения');
  }

  return await response.json();
};

// Принять приглашение
export const acceptInvite = async (inviteId: number): Promise<InviteResponse> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/invites/${inviteId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось принять приглашение');
  }

  return await response.json();
};

// Отклонить приглашение
export const declineInvite = async (inviteId: number): Promise<{ detail: string }> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/invites/${inviteId}/decline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось отклонить приглашение');
  }

  return await response.json();
};
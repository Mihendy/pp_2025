import { GroupRequest, GroupResponse } from '@/types/group.types';
import { InviteRequest, InviteResponse } from '@/types/invite.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getGroups = async (): Promise<GroupResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить группы');
  }

  return await response.json();
};

export const createGroup = async (data: GroupRequest): Promise<GroupResponse> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось создать группу');
  }

  return await response.json();
};


import { GroupMemberResponse } from '@/types/group.types';

// Получить группы, в которых ты участник
export const getMemberGroups = async (): Promise<GroupMemberResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/member/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить группы');
  }

  return await response.json();
};

// Получить группы, где пользователь — создатель
export const getCreatedGroups = async (): Promise<GroupResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/creator/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить группы');
  }

  return await response.json();
};

// Получить все группы (публичные/доступные)
export const getAllGroups = async (): Promise<GroupResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/all/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить список групп');
  }

  return await response.json();
};

export const removeUserFromGroup = async (
  groupId: number,
  userId: number
): Promise<{ detail: string }> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/remove-member/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось удалить пользователя');
  }

  return await response.json();
};

// Получить группы пользователя
export const getUserGroups = async (): Promise<GroupResponse[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/user/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить группы');
  }

  return await response.json();
};
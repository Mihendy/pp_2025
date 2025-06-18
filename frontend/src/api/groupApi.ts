import { GroupMemberResponse, GroupRequest, GroupResponse } from '@/types/group.types';
import { InviteRequest, InviteResponse } from '@/types/invite.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Получить все группы
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

// Создать новую группу
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

// Получить все доступные группы
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

// Получить участников группы
export const getGroupMembers = async (groupId: number): Promise<{ id: number; username: string }[]> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/members`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить участников');
  }

  return await response.json();
};

// Удалить участника из группы
export const removeUserFromGroup = async (groupId: number, userId: number): Promise<{ detail: string }> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/remove-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ user_id: userId }),
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

// Получить группу по ID
export const getGroupById = async (groupId: number): Promise<GroupResponse> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}/api/v1/groups/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Не удалось загрузить группу');
  }

  return await response.json();
};
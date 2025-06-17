export interface InviteRequest {
  group_id: number;
  sender_id: number;
  recipient_id: number;
}

export interface InviteResponse {
  id: number;
  group_id: number;
  sender_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}
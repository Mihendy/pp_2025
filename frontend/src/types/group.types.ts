export interface GroupRequest {
  name: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  creator_id: number;
  members: [];
}
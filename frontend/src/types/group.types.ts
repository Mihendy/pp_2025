export interface GroupRequest {
  name: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  creator_id: number;
  members: [];
}

export interface Group {
  id: number;
  name: string;
  creator_id: number;
}

export interface GroupMemberResponse {
  id: number;
  name: string;
  creator_id: number;
  members: number[];
}
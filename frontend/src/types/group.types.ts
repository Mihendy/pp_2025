export interface GroupRequest {
  name: string;
  description?: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
}
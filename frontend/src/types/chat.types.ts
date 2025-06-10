export interface ChatRequest {
  name: string;
  description?: string;
}

export interface ChatResponse {
  id: number;
  name: string;
  description?: string;
}
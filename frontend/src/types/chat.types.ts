export interface ChatRequest {
    name: string;
    description?: string;
}

export interface User {
    id: number;
    email: string;
}


export interface ChatResponse {
    id: number;
    name: string;
    description?: string;
    owner_id: number;
    members: number[];
}
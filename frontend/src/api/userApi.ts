// src/api/userApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAllUsers() {
    const resp = await fetch(`${API_URL}/api/v1/users/`);
    if (!resp.ok) throw new Error('Failed to fetch users');
    return resp.json(); // [{id, email, ...}]
}

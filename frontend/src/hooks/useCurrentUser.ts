import {useEffect, useState} from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useCurrentUser() {
    const [user, setUser] = useState<{ id: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/api/v1/users/me/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(res => setUser(res.data))
            .finally(() => setLoading(false));
    }, []);

    return {user, loading};
}

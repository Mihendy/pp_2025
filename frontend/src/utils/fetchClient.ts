// src/utils/fetchClient.ts

export const fetchClient = {
    post: async <T>(url: string, body: any): Promise<T> => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch {
                throw new Error('Ошибка сети');
            }
            throw new Error((errorData as any).detail || 'Ошибка запроса');
        }

        return await response.json();
    },
};
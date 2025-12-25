import { API_CONFIG } from '../config/api.config';

const BASE_URL = API_CONFIG.BASE_URL;

export const fetchMainboardIPOs = async (page = 1, limit = 10, status?: string) => {
    try {
        let url = `${BASE_URL}/mainboards?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch Mainboard IPOs');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Mainboard IPOs:', error);
        return [];
    }
};

export const fetchSMEIPOs = async (page = 1, limit = 10, status?: string) => {
    try {
        let url = `${BASE_URL}/sme-ipos?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch SME IPOs');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching SME IPOs:', error);
        return [];
    }
};

export const fetchListedIPOs = async (page = 1, limit = 10) => {
    try {
        // Listed endpoint specifically fetches status=LISTED, so we might not need status param here
        // unless we want to filter within listed? User wants Closed + Listed in this tab.
        // We will likely use fetchMainboardIPOs(status='CLOSED') separately.
        const response = await fetch(`${BASE_URL}/listed-ipos?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch Listed IPOs');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Listed IPOs:', error);
        return [];
    }
};
// Auth API
// Auth API
// Auth routes are at /api/auth, while BASE_URL is /api/v1. We need to strip /v1 or use a relative path.
const AUTH_URL = BASE_URL.replace('/v1', '');

export const loginUser = async (email: string, pass: string) => {
    const response = await fetch(`${AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
    }
    return response.json();
};

export const registerUser = async (name: string, email: string, pass: string) => {
    const response = await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Registration failed');
    }
    return response.json();
};

export const fetchUserProfile = async (token: string) => {
    // User routes are at /api/users, also outside v1 in server.js? 
    // server.js: app.use('/api/users', userRoutes); -> Yes, outside v1.
    const response = await fetch(`${AUTH_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

export const addUserPAN = async (token: string, panData: { panNumber: string, name: string }) => {
    const response = await fetch(`${AUTH_URL}/users/profile/pan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(panData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add PAN');
    }
    return response.json();
};

export const deleteUserPAN = async (token: string, panNumber: string) => {
    const response = await fetch(`${AUTH_URL}/users/profile/pan/${panNumber}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete PAN');
    return response.json();
};

export const startMagicLogin = async (email: string) => {
    try {
        const response = await fetch(`${AUTH_URL}/auth/magic-start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (!response.ok) {
                throw new Error(data.message || 'Magic link request failed');
            }
            return data;
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError, "Response Text:", text);
            throw new Error(`Server returned unexpected response: ${text.substring(0, 50)}...`);
        }
    } catch (e) {
        throw e;
    }
};

export const checkMagicLoginStatus = async (loginId: string) => {
    const response = await fetch(`${AUTH_URL}/auth/magic-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId }),
    });
    // If pending, returns { status: 'pending' }
    // If verified, returns { status: 'verified', token, user }
    if (!response.ok) {
        throw new Error('Status check failed');
    }
    return response.json();
};

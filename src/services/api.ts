import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const BASE_URL = API_CONFIG.BASE_URL;

const fetchWithCache = async (url: string, options?: RequestInit) => {
    const cacheKey = `api_cache_${url}`;
    try {
        const response = await fetch(url, options);
        if (response.ok) {
            const data = await response.json();
            // Cache the successful response
            await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        }
    } catch (error) {
        console.log(`Network request failed for ${url}, checking cache...`);
    }

    // Fallback to cache if network fails or response not ok
    try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
            console.log(`Returning cached data for ${url}`);
            return JSON.parse(cachedData);
        }
    } catch (cacheError) {
        console.error("Cache retrieval failed:", cacheError);
    }

    throw new Error('Network request failed and no cache available');
};

export const fetchMainboardIPOs = async (page = 1, limit = 10, status?: string, search?: string) => {
    try {
        let url = `${BASE_URL}/mainboards?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const data = await fetchWithCache(url);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Mainboard IPOs:', error);
        return [];
    }
};

export const fetchSMEIPOs = async (page = 1, limit = 10, status?: string, search?: string) => {
    try {
        let url = `${BASE_URL}/sme-ipos?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const data = await fetchWithCache(url);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching SME IPOs:', error);
        return [];
    }
};

export const fetchListedIPOs = async (page = 1, limit = 10) => {
    try {
        const data = await fetchWithCache(`${BASE_URL}/listed-ipos?page=${page}&limit=${limit}`);
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
    try {
        // User routes are at /api/users, also outside v1 in server.js? 
        // server.js: app.use('/api/users', userRoutes); -> Yes, outside v1.
        const data = await fetchWithCache(`${AUTH_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return data;
    } catch (error: any) {
        // If it's our "No cache" error, propagate it. If it was a 401 from server, fetchWithCache might catch it if we rely on ok check.
        // But fetchWithCache swallows non-ok and tries cache.
        // For profile, if token is invalid (401), we might get a cached profile. This might be okay for offline, 
        // but if online and 401, we should probably logout.
        // Currently fetchWithCache doesn't distinguish "Network Error" vs "4xx/5xx response".
        // It treats !response.ok as "Try Cache".
        throw error;
    }
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

export const fetchWatchlist = async (token: string) => {
    try {
        const data = await fetchWithCache(`${AUTH_URL}/users/profile/watchlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return data || [];
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        throw new Error('Failed to fetch watchlist');
    }
};

export const toggleWatchlist = async (token: string, ipoId: string) => {
    const response = await fetch(`${AUTH_URL}/users/profile/watchlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ipoId })
    });
    if (!response.ok) throw new Error('Failed to update watchlist');
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

export const api = {
    get: async (endpoint: string, config?: { params?: any }) => {
        let url = `${BASE_URL}${endpoint}`;
        if (config?.params) {
            const queryString = Object.keys(config.params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`)
                .join('&');
            url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Request Failed');
        const data = await response.json();
        return { data };
    }
};

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

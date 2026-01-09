import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../config/api.config';
import { IPOData } from '../types/ipo';
import { mapBackendToFrontend } from '../utils/mapper';

// Define a service using a base URL and expected endpoints
export const ipoApi = createApi({
    reducerPath: 'ipoApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_CONFIG.BASE_URL }),
    endpoints: (builder) => ({
        // Generic Get IPOs endpoint that can handle different types via arguments
        getIPOs: builder.query<IPOData[], { type: 'mainboard' | 'sme' | 'listed'; page?: number; limit?: number; status?: string; search?: string }>({
            query: ({ type, page = 1, limit = 10, status, search }) => {
                let path = '';
                switch (type) {
                    case 'sme':
                        path = '/sme/sme-ipos';
                        break;
                    case 'listed':
                        path = '/listed/listed-ipos';
                        break;
                    case 'mainboard':
                    default:
                        path = '/mainboard/mainboards';
                        break;
                }

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });

                if (status) params.append('status', status);
                if (search) params.append('search', search);

                return `${path}?${params.toString()}`;
            },
            // Transform response to match frontend IPOData structure immediately
            transformResponse: (response: { data: any[] }) => {
                return response.data.map(mapBackendToFrontend);
            },
        }),

        // Get IPO Details
        getIPODetails: builder.query<IPOData, { id: string; type: 'mainboard' | 'sme' }>({
            query: ({ id, type }) => {
                const path = type === 'sme' ? `/sme/sme-ipo/${id}` : `/mainboard/mainboard/${id}`;
                return path;
            },
            transformResponse: (response: { data: any } | any) => {
                // Handle both wrapped {data: {}} and direct {} responses just in case, though API usually sends {data}
                const backendData = response.data || response;
                return mapBackendToFrontend(backendData);
            },
        }),
        // Get Watchlist
        getWatchlist: builder.query<IPOData[], { token: string }>({
            query: ({ token }) => ({
                url: '/users/profile/watchlist',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
            transformResponse: (response: { data: any[] } | any[]) => {
                const list = Array.isArray(response) ? response : (response.data || []);
                return list.map(mapBackendToFrontend);
            }
        }),
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetIPOsQuery, useGetIPODetailsQuery, useLazyGetIPODetailsQuery, useLazyGetIPOsQuery, useGetWatchlistQuery, useLazyGetWatchlistQuery } = ipoApi;

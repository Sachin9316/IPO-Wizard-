import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { IPOData } from '../types/ipo';
import { useLazyGetIPOsQuery, useLazyGetWatchlistQuery } from '../services/ipoApi';

interface UseIPOListProps {
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed' | 'Watchlist' | 'Open' | 'Upcoming' | 'Closed' | 'ClosedListed';
    token: string | null;
    isAuthenticated: boolean;
}

export const useIPOList = ({ type, token, isAuthenticated }: UseIPOListProps) => {
    const [ipos, setIpos] = useState<IPOData[]>([]);
    const iposRef = useRef(ipos);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchStage, setFetchStage] = useState(0);

    const [triggerIPOs] = useLazyGetIPOsQuery();
    const [triggerWatchlist] = useLazyGetWatchlistQuery();

    useEffect(() => {
        iposRef.current = ipos;
    }, [ipos]);

    const loadData = useCallback((pageNum: number, stage: number, shouldRefresh = false) => {
        const executeLoad = async () => {
            try {
                if (pageNum === 1 && stage === 0) {
                    if (iposRef.current.length === 0 && !shouldRefresh) {
                        setLoading(true);
                    }
                } else {
                    setLoadingMore(true);
                }

                let fetchedData: any[] = [];
                const limit = 10;
                let currentFetchPromise: Promise<any[]> | null = null;

                if (type === 'Mainboard') {
                    if (stage === 0) currentFetchPromise = triggerIPOs({ type: 'mainboard', page: pageNum, limit, status: 'OPEN' }).unwrap();
                } else if (type === 'SME') {
                    if (stage === 0) currentFetchPromise = triggerIPOs({ type: 'sme', page: pageNum, limit, status: 'OPEN' }).unwrap();
                } else if (type === 'Listed') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbListed, smeListed] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'LISTED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'LISTED' }).unwrap()
                        ]);
                        fetchedData = [...mbListed, ...smeListed].sort((a, b) => new Date(b.rawDates.listing || b.rawDates.offerEnd).getTime() - new Date(a.rawDates.listing || a.rawDates.offerEnd).getTime());
                    }
                } else if (type === 'Upcoming') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbUpcoming, smeUpcoming] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'UPCOMING' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'UPCOMING' }).unwrap()
                        ]);
                        fetchedData = [...mbUpcoming, ...smeUpcoming].sort((a, b) => new Date(a.rawDates.offerStart).getTime() - new Date(b.rawDates.offerStart).getTime());
                    }
                } else if (type === 'Open') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbOpen, smeOpen] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'OPEN' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'OPEN' }).unwrap()
                        ]);
                        fetchedData = [...mbOpen, ...smeOpen].sort((a, b) => new Date(a.rawDates.offerEnd).getTime() - new Date(b.rawDates.offerEnd).getTime());
                    }
                } else if (type === 'Closed') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbClosed, smeClosed] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'CLOSED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'CLOSED' }).unwrap()
                        ]);
                        fetchedData = [...mbClosed, ...smeClosed];
                        fetchedData.sort((a, b) => new Date(b.rawDates.offerEnd).getTime() - new Date(a.rawDates.offerEnd).getTime());
                    }
                } else if (type === 'ClosedListed') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbClosed, mbListed, smeClosed, smeListed] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'CLOSED' }).unwrap(),
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 20, status: 'LISTED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'CLOSED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 20, status: 'LISTED' }).unwrap()
                        ]);
                        fetchedData = [...mbClosed, ...mbListed, ...smeClosed, ...smeListed];
                        fetchedData.sort((a, b) => new Date(b.rawDates.offerEnd).getTime() - new Date(a.rawDates.offerEnd).getTime());
                    }
                } else if (type === 'Alloted') {
                    if (pageNum === 1 && stage === 0) {
                        const [mbClosed, mbListed, smeClosed, smeListed] = await Promise.all([
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 50, status: 'CLOSED' }).unwrap(),
                            triggerIPOs({ type: 'mainboard', page: 1, limit: 50, status: 'LISTED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 50, status: 'CLOSED' }).unwrap(),
                            triggerIPOs({ type: 'sme', page: 1, limit: 50, status: 'LISTED' }).unwrap()
                        ]);
                        fetchedData = [...mbClosed, ...mbListed, ...smeClosed, ...smeListed].filter(ipo => ipo.isAllotmentOut);
                        fetchedData.sort((a, b) => new Date(b.rawDates.offerEnd).getTime() - new Date(a.rawDates.offerEnd).getTime());
                    }
                } else if (type === 'Watchlist') {
                    if (isAuthenticated && token) {
                        if (pageNum === 1 && stage === 0) {
                            currentFetchPromise = triggerWatchlist({ token }).unwrap();
                        }
                    }
                }

                if (currentFetchPromise) {
                    fetchedData = await currentFetchPromise;
                }

                if (shouldRefresh) {
                    setIpos(fetchedData);
                } else {
                    setIpos(prev => [...prev, ...fetchedData]);
                }

                // Stage Transition Logic
                const complexTypes = ['Alloted', 'Watchlist', 'Upcoming', 'Listed', 'Open', 'ClosedListed', 'Mainboard', 'SME'];
                if (fetchedData.length < limit && !complexTypes.includes(type)) {
                    // Legacy stage logic if we ever add back multi-stage fetching for specific types
                    // For now, most have single stage or parallel fetch
                    setHasMore(false);
                } else {
                    if (complexTypes.includes(type)) setHasMore(false);
                    else setHasMore(true);
                }

            } catch (error) {
                console.error("Failed to load IPOs", error);
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
        };

        executeLoad();
    }, [type, token, isAuthenticated, triggerIPOs, triggerWatchlist]);

    useEffect(() => {
        loadData(1, 0, true);
    }, [loadData, type]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setFetchStage(0);
        setHasMore(true);
        loadData(1, 0, true);
    }, [loadData]);

    const loadMore = useCallback(() => {
        // Filter out types that don't support pagination or are fully loaded in one go
        const noPaginationTypes = ['Alloted', 'Watchlist', 'Upcoming', 'Listed', 'Open', 'ClosedListed', 'Mainboard', 'SME'];
        if (!loadingMore && hasMore && !loading && !noPaginationTypes.includes(type)) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage, fetchStage);
        }
    }, [loadingMore, hasMore, loading, type, page, fetchStage, loadData]);

    return {
        ipos,
        loading,
        refreshing,
        loadingMore,
        onRefresh,
        loadMore,
        page,
        fetchStage
    };
};

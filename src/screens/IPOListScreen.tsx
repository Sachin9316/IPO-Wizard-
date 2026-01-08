import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ClipboardList, LogIn, Search } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../types/ipo';
import { IPOCard } from '../components/IPOCard';
import { SkeletonIPOCard } from '../components/SkeletonIPOCard';
import { EmptyState } from '../components/EmptyState';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { fetchMainboardIPOs, fetchSMEIPOs, fetchListedIPOs, fetchWatchlist } from '../services/api';
import { mapBackendToFrontend } from '../utils/mapper';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

interface IPOListScreenProps {
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed' | 'Watchlist' | 'Open' | 'Upcoming' | 'Closed' | 'ClosedListed';
}

export const IPOListScreen = ({ route }: { route?: { params: IPOListScreenProps } }) => {
    const { type } = route?.params || { type: 'Mainboard' };
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { token, isAuthenticated } = useAuth();
    const { headerFilter } = useUI();
    const isFocused = useIsFocused();
    const [localHeaderFilter, setLocalHeaderFilter] = React.useState(headerFilter);
    const [ipos, setIpos] = React.useState<IPOData[]>([]);

    // Lazy update of filter to prevent background tabs from re-rendering list
    React.useEffect(() => {
        if (isFocused) {
            setLocalHeaderFilter(headerFilter);
        }
    }, [headerFilter, isFocused]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    // Pagination & Multi-stage Fetching State
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [fetchStage, setFetchStage] = React.useState(0);



    // Define loadData BEFORE using it in useEffect
    const loadData = React.useCallback(async (pageNum: number, stage: number, shouldRefresh = false) => {
        try {
            if (pageNum === 1 && stage === 0) setLoading(true);
            else setLoadingMore(true);

            let fetchedData: any[] = [];
            const limit = 10;
            let currentFetchPromise: Promise<any[]> | null = null;



            if (type === 'Mainboard') {
                // Stage 0: OPEN
                if (stage === 0) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'OPEN');
            } else if (type === 'SME') {
                // Stage 0: OPEN
                if (stage === 0) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'OPEN');
            } else if (type === 'Listed') {
                if (pageNum === 1 && stage === 0) {
                    const [mbListed, smeListed] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'LISTED'),
                        fetchSMEIPOs(1, 20, 'LISTED')
                    ]);
                    fetchedData = [...mbListed, ...smeListed].sort((a, b) => new Date(b.listing_date || b.close_date).getTime() - new Date(a.listing_date || a.close_date).getTime());
                }
            } else if (type === 'Upcoming') {
                // Fetch both Mainboard and SME UPCOMING IPOs only
                if (pageNum === 1 && stage === 0) {
                    const [mbUpcoming, smeUpcoming] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'UPCOMING'),
                        fetchSMEIPOs(1, 20, 'UPCOMING')
                    ]);

                    // Sort by open date (soonest first)
                    fetchedData = [...mbUpcoming, ...smeUpcoming].sort((a, b) => new Date(a.open_date).getTime() - new Date(b.open_date).getTime());
                }
            } else if (type === 'Open') {
                // Fetch both Mainboard and SME OPEN IPOs
                if (pageNum === 1 && stage === 0) {
                    const [mbOpen, smeOpen] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'OPEN'),
                        fetchSMEIPOs(1, 20, 'OPEN')
                    ]);

                    // Sort by open date? Or close date? Usually close date for open IPOs to show urgency?
                    // User didn't specify, but "Closing Soon" logic usually implies sorting by close date.
                    fetchedData = [...mbOpen, ...smeOpen].sort((a, b) => new Date(a.close_date).getTime() - new Date(b.close_date).getTime());
                }
            } else if (type === 'Closed') {
                // Fetch both Mainboard and SME Closed IPOs and merge
                // This can be large, so limiting to recent ones (page 1)
                // Or we could implement stage 0=MB Closed, stage 1=SME Closed like Listed?
                // But user wants "Closed IPOs" list.
                // Let's do parallel fetch for now (page 1 only effectively)
                if (pageNum === 1 && stage === 0) {
                    const [mbClosed, smeClosed] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'CLOSED'),
                        fetchSMEIPOs(1, 20, 'CLOSED')
                    ]);
                    fetchedData = [...mbClosed, ...smeClosed];
                    // Sort by close date descending (most recently closed)
                    fetchedData.sort((a, b) => new Date(b.close_date).getTime() - new Date(a.close_date).getTime());
                }
            } else if (type === 'ClosedListed') {
                // Fetch ALL Closed and Listed logic with Search
                if (pageNum === 1 && stage === 0) {
                    const [mbClosed, mbListed, smeClosed, smeListed] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'CLOSED'),
                        fetchMainboardIPOs(1, 20, 'LISTED'),
                        fetchSMEIPOs(1, 20, 'CLOSED'),
                        fetchSMEIPOs(1, 20, 'LISTED')
                    ]);
                    // Only show IPOs where allotment is still awaited
                    fetchedData = [...mbClosed, ...mbListed, ...smeClosed, ...smeListed].filter(ipo => !ipo.isAllotmentOut);

                    // Sort by close date (recent first)
                    fetchedData.sort((a, b) => new Date(b.close_date).getTime() - new Date(a.close_date).getTime());
                }
            } else if (type === 'Alloted') {
                // Keeping simpler logic for Alloted for now
                if (pageNum === 1 && stage === 0) {
                    const [mbClosed, mbListed, smeClosed, smeListed] = await Promise.all([
                        fetchMainboardIPOs(1, 50, 'CLOSED'),
                        fetchMainboardIPOs(1, 50, 'LISTED'),
                        fetchSMEIPOs(1, 50, 'CLOSED'),
                        fetchSMEIPOs(1, 50, 'LISTED')
                    ]);
                    // Only show IPOs where allotment is out
                    fetchedData = [...mbClosed, ...mbListed, ...smeClosed, ...smeListed].filter(ipo => ipo.isAllotmentOut);

                    // Sort by close date (recent first)
                    fetchedData.sort((a, b) => new Date(b.close_date).getTime() - new Date(a.close_date).getTime());
                }
            } else if (type === 'Watchlist') {
                if (isAuthenticated && token) {
                    // Watchlist is not paginated yet in backend, fetches all
                    if (pageNum === 1 && stage === 0) {
                        currentFetchPromise = fetchWatchlist(token);
                    }
                }
            }

            if (currentFetchPromise) {
                fetchedData = await currentFetchPromise;
            }

            const mappedData = fetchedData.map(mapBackendToFrontend);

            if (shouldRefresh) {
                setIpos(mappedData);
            } else {
                setIpos(prev => [...prev, ...mappedData]);
            }

            // Stage Transition Logic
            if (fetchedData.length < limit && type !== 'Alloted' && type !== 'Watchlist' && type !== 'Upcoming' && type !== 'Listed' && type !== 'Open' && type !== 'ClosedListed' && type !== 'Mainboard' && type !== 'SME') {
                let nextStage = -1;
                // Mainboard and SME now only has stage 0 (Open), no transition needed.
                // if ((type === 'Mainboard' || type === 'SME') && stage === 0) nextStage = 1; 

                // if (type === 'Listed' && stage < 2) nextStage = stage + 1;

                if (nextStage !== -1) {
                    setFetchStage(nextStage);
                    setPage(0); // Reset to 0 so next loadMore increments to 1
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
            } else {
                if (type === 'Watchlist' || type === 'Alloted' || type === 'Upcoming' || type === 'Listed' || type === 'Open' || type === 'ClosedListed' || type === 'Mainboard' || type === 'SME') setHasMore(false);
                else setHasMore(true);
            }

        } catch (error) {
            console.error("Failed to load IPOs", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [type, token, isAuthenticated]);

    // NOW use loadData in useEffects
    // Reload data when debounced query changes (only for Alloted)
    React.useEffect(() => {
        if (type === 'Alloted' || type === 'ClosedListed') {
            loadData(1, 0, true);
        }
    }, [loadData, type]);

    // Initial load on mount for others
    React.useEffect(() => {
        if (type !== 'Alloted' && type !== 'ClosedListed') {
            loadData(1, 0, true);
        }
    }, [loadData, type]);


    const handlePress = React.useCallback((item: IPOData) => {
        navigation.navigate('IPODetails', { item });
    }, [navigation]);

    const renderItem = React.useCallback(({ item }: { item: IPOData }) => (
        <IPOCard item={item} onPress={handlePress} />
    ), [handlePress]);

    const keyExtractor = React.useCallback((item: IPOData) => item.id, []);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setFetchStage(0);
        setHasMore(true);
        loadData(1, 0, true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore && !loading && type !== 'Alloted' && type !== 'Watchlist' && type !== 'Upcoming' && type !== 'Listed' && type !== 'Open' && type !== 'ClosedListed' && type !== 'Mainboard' && type !== 'SME') {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage, fetchStage);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };



    // Filter Logic
    // Filter Logic
    const filteredIpos = React.useMemo(() => {
        let result = ipos;

        // 1. Apply Type-Specific Filters
        // 1. Apply Type-Specific Filters
        // (Previously used closedListedFilter here, now removed as per requirement)

        // 2. Apply Global Header Filter (ALL | SME | MAINBOARD)
        if (localHeaderFilter === 'SME') {
            result = result.filter(ipo => ipo.type === 'SME');
        } else if (localHeaderFilter === 'MAINBOARD') {
            result = result.filter(ipo => ipo.type === 'Mainboard');
        }

        return result;
    }, [ipos, type, localHeaderFilter]);


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.primary} stopOpacity="0.15" />
                        <Stop offset="0.5" stopColor={colors.background} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#grad)" />
            </Svg>



            {loading && !refreshing && page === 1 && fetchStage === 0 ? (
                <View style={{ flex: 1, padding: 16 }}>
                    <SkeletonIPOCard />
                    <SkeletonIPOCard />
                    <SkeletonIPOCard />
                    <SkeletonIPOCard />
                </View>
            ) : (
                <FlatList
                    data={filteredIpos}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    initialNumToRender={8}
                    windowSize={10}
                    maxToRenderPerBatch={8}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    contentContainerStyle={[styles.listContent, type === 'Alloted' && { paddingTop: 8 }]}
                    ListEmptyComponent={
                        type === 'Watchlist' && !isAuthenticated ? (
                            <EmptyState
                                icon={LogIn}
                                title="Login Required"
                                description="Sign in to save IPOs to your watchlist and track them easily."
                                buttonText="Login / Register"
                                onButtonPress={() => navigation.navigate('Profile')}
                            />
                        ) : (
                            <EmptyState
                                icon={type === 'Alloted' ? Search : ClipboardList}
                                title={type === 'Alloted' ? "No Allotment Results" : "No IPOs Found"}
                                description={type === 'Alloted'
                                    ? "We couldn't find any allotment results matching your search or filters."
                                    : "There are currently no IPOs listed in this category. Check back later!"}
                                buttonText={undefined}
                                onButtonPress={undefined}
                            />
                        )
                    }
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    searchInput: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
});

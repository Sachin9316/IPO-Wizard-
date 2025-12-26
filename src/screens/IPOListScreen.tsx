import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Filter, X, ClipboardList, LogIn, Search } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../types/ipo';
import { IPOCard } from '../components/IPOCard';
import { SkeletonIPOCard } from '../components/SkeletonIPOCard';
import { EmptyState } from '../components/EmptyState';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchMainboardIPOs, fetchSMEIPOs, fetchListedIPOs, fetchWatchlist } from '../services/api';
import { mapBackendToFrontend } from '../utils/mapper';
import { useAuth } from '../context/AuthContext';

interface IPOListScreenProps {
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed' | 'Watchlist';
}

export const IPOListScreen = ({ route }: { route: { params: IPOListScreenProps } }) => {
    const { type } = route.params || { type: 'Mainboard' };
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { token, isAuthenticated } = useAuth();
    const [ipos, setIpos] = React.useState<IPOData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    // Pagination & Multi-stage Fetching State
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [fetchStage, setFetchStage] = React.useState(0);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedQuery, setDebouncedQuery] = React.useState('');

    // Debounce Search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Define loadData BEFORE using it in useEffect
    const loadData = React.useCallback(async (pageNum: number, stage: number, shouldRefresh = false) => {
        try {
            if (pageNum === 1 && stage === 0) setLoading(true);
            else setLoadingMore(true);

            let fetchedData: any[] = [];
            const limit = 10;
            let currentFetchPromise: Promise<any[]> | null = null;

            // Pass search query if type is Alloted
            const search = type === 'Alloted' ? debouncedQuery : undefined;

            if (type === 'Mainboard') {
                // Stage 0: OPEN, Stage 1: UPCOMING
                if (stage === 0) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'OPEN');
                else if (stage === 1) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'UPCOMING');
            } else if (type === 'SME') {
                // Stage 0: OPEN, Stage 1: UPCOMING
                if (stage === 0) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'OPEN');
                else if (stage === 1) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'UPCOMING');
            } else if (type === 'Listed') {
                // Stage 0: Mainboard Closed, Stage 1: SME Closed, Stage 2: Listed
                if (stage === 0) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'CLOSED');
                else if (stage === 1) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'CLOSED');
                else if (stage === 2) currentFetchPromise = fetchListedIPOs(pageNum, limit);
            } else if (type === 'Alloted') {
                // Keeping simpler logic for Alloted for now
                if (pageNum === 1 && stage === 0) {
                    const [mbClosed, mbListed, smeClosed, smeListed] = await Promise.all([
                        fetchMainboardIPOs(1, 50, 'CLOSED', search),
                        fetchMainboardIPOs(1, 50, 'LISTED', search),
                        fetchSMEIPOs(1, 50, 'CLOSED', search),
                        fetchSMEIPOs(1, 50, 'LISTED', search)
                    ]);
                    // Merge all closed/listed IPOs
                    fetchedData = [...mbClosed, ...mbListed, ...smeClosed, ...smeListed];

                    // Sort by isAllotmentOut (true first) then by close_date descending (recent first)
                    fetchedData.sort((a, b) => {
                        if (a.isAllotmentOut === b.isAllotmentOut) {
                            return new Date(b.close_date).getTime() - new Date(a.close_date).getTime();
                        }
                        return a.isAllotmentOut ? -1 : 1;
                    });
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
            if (fetchedData.length < limit && type !== 'Alloted' && type !== 'Watchlist') {
                let nextStage = -1;
                if ((type === 'Mainboard' || type === 'SME') && stage === 0) nextStage = 1;
                else if (type === 'Listed' && stage < 2) nextStage = stage + 1;

                if (nextStage !== -1) {
                    setFetchStage(nextStage);
                    setPage(0); // Reset to 0 so next loadMore increments to 1
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
            } else {
                if (type === 'Watchlist' || type === 'Alloted') setHasMore(false); // No pagination for now
                else setHasMore(true);
            }

        } catch (error) {
            console.error("Failed to load IPOs", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [type, token, isAuthenticated, debouncedQuery]);

    // NOW use loadData in useEffects
    // Reload data when debounced query changes (only for Alloted)
    React.useEffect(() => {
        if (type === 'Alloted') {
            loadData(1, 0, true);
        }
    }, [debouncedQuery, loadData, type]);

    // Initial load on mount for others
    React.useEffect(() => {
        if (type !== 'Alloted') {
            loadData(1, 0, true);
        }
    }, [loadData, type]);

    // Refresh when tab comes into focus (only for Watchlist to sync changes)
    useFocusEffect(
        React.useCallback(() => {
            if (type === 'Watchlist') {
                loadData(1, 0, true);
            }
        }, [loadData, type])
    );

    const handlePress = (item: IPOData) => {
        navigation.navigate('IPODetails', { item });
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setFetchStage(0);
        setHasMore(true);
        loadData(1, 0, true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore && !loading && type !== 'Alloted' && type !== 'Watchlist') {
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

    const [filterType, setFilterType] = React.useState<'ALL' | 'OUT' | 'AWAITED'>('ALL');

    // Filter Logic
    const filteredIpos = React.useMemo(() => {
        if (type !== 'Alloted') return ipos;
        if (filterType === 'ALL') return ipos;
        if (filterType === 'OUT') return ipos.filter(ipo => ipo.isAllotmentOut);
        if (filterType === 'AWAITED') return ipos.filter(ipo => !ipo.isAllotmentOut);
        return ipos;
    }, [ipos, filterType, type]);

    const [showFilterMenu, setShowFilterMenu] = React.useState(false);

    // Custom header with Search for Alloted - Moved outside renderHeader function to be inline for sticky behavior
    const headerContent = type === 'Alloted' ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 3000 }}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                height: 48
            }}>
                <TextInput
                    style={{ flex: 1, color: colors.text, fontSize: 16 }}
                    placeholder="Search IPOs..."
                    placeholderTextColor={colors.text + '80'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <X color={colors.text} size={20} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={{ zIndex: 3001 }}>
                <TouchableOpacity
                    onPress={() => setShowFilterMenu(!showFilterMenu)}
                    style={{
                        height: 48,
                        width: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                >
                    <Filter color={filterType === 'ALL' ? colors.text : colors.primary} size={24} />
                </TouchableOpacity>

                {showFilterMenu && (
                    <View style={{
                        position: 'absolute',
                        top: 52,
                        right: 0,
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        minWidth: 160,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        zIndex: 4000
                    }}>
                        <TouchableOpacity
                            style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                            onPress={() => { setFilterType('ALL'); setShowFilterMenu(false); }}
                        >
                            <Text style={{ color: filterType === 'ALL' ? colors.primary : colors.text, fontWeight: filterType === 'ALL' ? 'bold' : 'normal' }}>All</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: colors.border }} />
                        <TouchableOpacity
                            style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                            onPress={() => { setFilterType('OUT'); setShowFilterMenu(false); }}
                        >
                            <Text style={{ color: filterType === 'OUT' ? colors.primary : colors.text, fontWeight: filterType === 'OUT' ? 'bold' : 'normal' }}>Allotment Out</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: colors.border }} />
                        <TouchableOpacity
                            style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                            onPress={() => { setFilterType('AWAITED'); setShowFilterMenu(false); }}
                        >
                            <Text style={{ color: filterType === 'AWAITED' ? colors.primary : colors.text, fontWeight: filterType === 'AWAITED' ? 'bold' : 'normal' }}>Awaited</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    ) : null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {headerContent}

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
                    renderItem={({ item }) => <IPOCard item={item} onPress={handlePress} />}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
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
                                buttonText={type === 'Alloted' ? "Clear Search" : undefined}
                                onButtonPress={type === 'Alloted' ? () => setSearchQuery('') : undefined}
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

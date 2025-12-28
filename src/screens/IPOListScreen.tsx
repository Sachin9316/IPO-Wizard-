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
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed' | 'Watchlist' | 'Open' | 'Closed' | 'ClosedListed';
}

export const IPOListScreen = ({ route }: { route?: { params: IPOListScreenProps } }) => {
    const { type } = route?.params || { type: 'Mainboard' };
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

    // Filters for ClosedListed screen
    const [closedListedFilter, setClosedListedFilter] = React.useState({
        category: 'ALL', // 'ALL', 'MAINBOARD', 'SME'
        status: 'ALL',    // 'ALL', 'CLOSED', 'LISTED'
        allotment: 'ALL' // 'ALL', 'OUT', 'AWAITED'
    });

    // Filters for Upcoming (Open) screen
    const [upcomingFilter, setUpcomingFilter] = React.useState({
        category: 'ALL' // 'ALL', 'MAINBOARD', 'SME'
    });

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

            // Pass search query if type is Alloted OR ClosedListed
            const search = (type === 'Alloted' || type === 'ClosedListed') ? debouncedQuery : undefined;

            if (type === 'Mainboard') {
                // Stage 0: OPEN
                if (stage === 0) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'OPEN');
            } else if (type === 'SME') {
                // Stage 0: OPEN
                if (stage === 0) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'OPEN');
            } else if (type === 'Listed') {
                // Stage 0: Mainboard Closed, Stage 1: SME Closed, Stage 2: Listed
                if (stage === 0) currentFetchPromise = fetchMainboardIPOs(pageNum, limit, 'CLOSED');
                else if (stage === 1) currentFetchPromise = fetchSMEIPOs(pageNum, limit, 'CLOSED');
                else if (stage === 2) currentFetchPromise = fetchListedIPOs(pageNum, limit);
            } else if (type === 'Open') {
                // Fetch both Mainboard and SME UPCOMING IPOs only
                if (pageNum === 1 && stage === 0) {
                    const [mbUpcoming, smeUpcoming] = await Promise.all([
                        fetchMainboardIPOs(1, 20, 'UPCOMING'),
                        fetchSMEIPOs(1, 20, 'UPCOMING')
                    ]);

                    // Sort by open date (soonest first)
                    fetchedData = [...mbUpcoming, ...smeUpcoming].sort((a, b) => new Date(a.open_date).getTime() - new Date(b.open_date).getTime());
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
                        fetchMainboardIPOs(1, 20, 'CLOSED', search),
                        fetchMainboardIPOs(1, 20, 'LISTED', search),
                        fetchSMEIPOs(1, 20, 'CLOSED', search),
                        fetchSMEIPOs(1, 20, 'LISTED', search)
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
                        fetchMainboardIPOs(1, 50, 'CLOSED', search),
                        fetchMainboardIPOs(1, 50, 'LISTED', search),
                        fetchSMEIPOs(1, 50, 'CLOSED', search),
                        fetchSMEIPOs(1, 50, 'LISTED', search)
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
            if (fetchedData.length < limit && type !== 'Alloted' && type !== 'Watchlist' && type !== 'Open' && type !== 'ClosedListed' && type !== 'Mainboard' && type !== 'SME') {
                let nextStage = -1;
                // Mainboard and SME now only has stage 0 (Open), no transition needed.
                // if ((type === 'Mainboard' || type === 'SME') && stage === 0) nextStage = 1; 

                if (type === 'Listed' && stage < 2) nextStage = stage + 1;

                if (nextStage !== -1) {
                    setFetchStage(nextStage);
                    setPage(0); // Reset to 0 so next loadMore increments to 1
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
            } else {
                if (type === 'Watchlist' || type === 'Alloted' || type === 'Open' || type === 'ClosedListed' || type === 'Mainboard' || type === 'SME') setHasMore(false);
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
        if (type === 'Alloted' || type === 'ClosedListed') {
            loadData(1, 0, true);
        }
    }, [debouncedQuery, loadData, type]);

    // Initial load on mount for others
    React.useEffect(() => {
        if (type !== 'Alloted' && type !== 'ClosedListed') {
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
        if (!loadingMore && hasMore && !loading && type !== 'Alloted' && type !== 'Watchlist' && type !== 'Open' && type !== 'ClosedListed' && type !== 'Mainboard' && type !== 'SME') {
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

    const [filterType, setFilterType] = React.useState<'ALL' | 'OUT' | 'AWAITED'>('ALL'); // For Alloted

    // Filter Logic
    const filteredIpos = React.useMemo(() => {
        if (type === 'Open') {
            return ipos.filter(ipo => {
                // Handle potentially different checking casing (Mainboard vs MAINBOARD)
                // Assuming ipo.type is 'Mainboard' or 'SME'
                const filterCat = upcomingFilter.category;
                if (filterCat === 'ALL') return true;
                return ipo.type.toUpperCase() === filterCat.toUpperCase();
            });
        }
        if (type === 'ClosedListed') {
            return ipos.filter(ipo => {
                const catMatch = closedListedFilter.category === 'ALL' || (ipo.type && ipo.type.toUpperCase() === closedListedFilter.category.toUpperCase());
                // Currently 'status' from backend is 'Mainboard IPO' which is vague? No, mapper handles status?
                // Mapper maps status to 'Open' | 'Closed' | 'Listed' | 'Upcoming'.
                const statusMatch = closedListedFilter.status === 'ALL' ||
                    (closedListedFilter.status === 'CLOSED' && ipo.status === 'Closed');

                return catMatch && statusMatch;
            });
        }
        if (type === 'Alloted') return ipos;
        return ipos;
        return ipos;
    }, [ipos, filterType, type, closedListedFilter, upcomingFilter]);

    const [showFilterMenu, setShowFilterMenu] = React.useState(false);

    // Custom header with Search for Alloted - Moved outside renderHeader function to be inline for sticky behavior
    const headerContent = (type === 'Alloted' || type === 'ClosedListed' || type === 'Open') ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 3000 }}>
            {(type === 'Alloted' || type === 'ClosedListed') && (
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
            )}

            {type === 'Open' && (
                <View style={{ flexDirection: 'row', alignItems: 'start', gap: 8 }}>
                    {['ALL', 'Mainboard', 'SME'].map((cat) => {
                        const isSelected = upcomingFilter.category.toUpperCase() === (cat === 'Mainboard' ? 'MAINBOARD' : cat.toUpperCase());
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={{
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                    backgroundColor: isSelected ? colors.primary : colors.card,
                                    borderWidth: 1, borderColor: isSelected ? colors.primary : colors.border
                                }}
                                onPress={() => setUpcomingFilter(prev => ({ ...prev, category: cat === 'Mainboard' ? 'MAINBOARD' : cat }))}
                            >
                                <Text style={{ fontSize: 12, color: isSelected ? '#FFF' : colors.text, fontWeight: 'bold' }}>{cat}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}


            {(type === 'ClosedListed' || type === 'Mainboard') && (
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
                        <Filter color={(closedListedFilter.category !== 'ALL' || closedListedFilter.status !== 'ALL') ? colors.primary : colors.text} size={24} />
                    </TouchableOpacity>

                    {showFilterMenu && (
                        <View style={{
                            position: 'absolute',
                            top: 52,
                            right: 0,
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            minWidth: 200,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            zIndex: 4000
                        }}>
                            <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Category</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {['ALL', 'Mainboard', 'SME'].map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                            backgroundColor: (closedListedFilter.category === (cat === 'Mainboard' ? 'MAINBOARD' : cat)) ? colors.primary + '20' : colors.card,
                                            borderWidth: 1, borderColor: (closedListedFilter.category === (cat === 'Mainboard' ? 'MAINBOARD' : cat)) ? colors.primary : colors.border
                                        }}
                                        onPress={() => setClosedListedFilter(prev => ({ ...prev, category: cat === 'Mainboard' ? 'MAINBOARD' : cat }))}
                                    >
                                        <Text style={{ fontSize: 12, color: colors.text }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />

                            <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Status</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {['ALL', 'CLOSED'].map((stat) => (
                                    <TouchableOpacity
                                        key={stat}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                            backgroundColor: closedListedFilter.status === stat ? colors.primary + '20' : colors.card,
                                            borderWidth: 1, borderColor: closedListedFilter.status === stat ? colors.primary : colors.border
                                        }}
                                        onPress={() => setClosedListedFilter(prev => ({ ...prev, status: stat }))}
                                    >
                                        <Text style={{ fontSize: 12, color: colors.text, textTransform: 'capitalize' }}>{stat.toLowerCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}
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

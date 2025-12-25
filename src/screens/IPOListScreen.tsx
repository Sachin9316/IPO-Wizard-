import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../data/dummyData';
import { IPOCard } from '../components/IPOCard';
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

    const loadData = React.useCallback(async (pageNum: number, stage: number, shouldRefresh = false) => {
        try {
            if (pageNum === 1 && stage === 0) setLoading(true);
            else setLoadingMore(true);

            let fetchedData: any[] = [];
            const limit = 10;
            let currentFetchPromise: Promise<any[]> | null = null;

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
                    const [mb, sme] = await Promise.all([fetchMainboardIPOs(1, 100), fetchSMEIPOs(1, 100)]);
                    fetchedData = [...mb, ...sme].filter(ipo => ipo.status === 'Closed' || ipo.isAllotmentOut);
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
    }, [type, token, isAuthenticated]);

    // Initial load on mount
    React.useEffect(() => {
        loadData(1, 0, true);
    }, [loadData]);

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

    if (loading && !refreshing && page === 1 && fetchStage === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={ipos}
                renderItem={({ item }) => <IPOCard item={item} onPress={handlePress} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>
                            {type === 'Watchlist' && !isAuthenticated
                                ? "Please login to view your watchlist."
                                : "No IPOs found."}
                        </Text>
                    </View>
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />
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
});

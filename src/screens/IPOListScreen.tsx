import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../data/dummyData';
import { IPOCard } from '../components/IPOCard';
import { useNavigation } from '@react-navigation/native';
import { fetchMainboardIPOs, fetchSMEIPOs, fetchListedIPOs } from '../services/api';
import { mapBackendToFrontend } from '../utils/mapper';

interface IPOListScreenProps {
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed';
}

export const IPOListScreen = ({ route }: { route: { params: IPOListScreenProps } }) => {
    const { type } = route.params || { type: 'Mainboard' };
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
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
            if (fetchedData.length < limit && type !== 'Alloted') {
                let nextStage = -1;
                if ((type === 'Mainboard' || type === 'SME') && stage === 0) nextStage = 1;
                else if (type === 'Listed' && stage < 2) nextStage = stage + 1;

                if (nextStage !== -1) {
                    setFetchStage(nextStage);
                    setPage(0); // Reset to 0 so next loadMore increments to 1
                    setHasMore(true);
                    // Optional: If the list is very short, trigger next load immediately?
                    // Rely on onEndReached for now.
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error("Failed to load IPOs", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [type]);

    React.useEffect(() => {
        loadData(1, 0, true);
    }, [type]); // Reset when type changes

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
        if (!loadingMore && hasMore && !loading && type !== 'Alloted') {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage, fetchStage);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <Text style={{ textAlign: 'center', color: colors.text }}>Loading more...</Text>
            </View>
        );
    };

    if (loading && !refreshing && page === 1 && fetchStage === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
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
                ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>No IPOs found.</Text>}
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

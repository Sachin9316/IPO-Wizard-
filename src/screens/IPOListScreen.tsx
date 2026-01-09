import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ClipboardList, LogIn, Search } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../types/ipo';
import { IPOCard } from '../components/IPOCard';
import { SkeletonIPOCard } from '../components/SkeletonIPOCard';
import { EmptyState } from '../components/EmptyState';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useIPOList } from '../hooks/useIPOList';

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

    // Use Custom Hook for Data Fetching
    const {
        ipos,
        loading,
        refreshing,
        loadingMore,
        onRefresh,
        loadMore,
        page,
        fetchStage
    } = useIPOList({ type, token, isAuthenticated });

    // Sync header filter lazily
    React.useEffect(() => {
        if (isFocused) {
            setLocalHeaderFilter(headerFilter);
        }
    }, [headerFilter, isFocused]);

    const handlePress = React.useCallback((item: IPOData) => {
        navigation.navigate('IPODetails', { item });
    }, [navigation]);

    const renderItem = React.useCallback(({ item }: { item: IPOData }) => (
        <IPOCard item={item} onPress={handlePress} />
    ), [handlePress]);

    const keyExtractor = React.useCallback((item: IPOData) => item.id, []);

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    // UI-side Filtering
    const filteredIpos = React.useMemo(() => {
        let result = ipos;
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
                    contentContainerStyle={styles.listContent}
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
});

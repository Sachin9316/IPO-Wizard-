import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { ArrowLeft, CheckCircle, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useGetIPODetailsQuery } from '../../services/ipoApi';
import { toggleWatchlist } from '../../services/api';
import { SkeletonDetail } from '../../components/SkeletonDetail';
import { useUI } from '../../context/UIContext';
import { IPOHero } from '../../components/details/IPOHero';
import { IPOStats } from '../../components/details/IPOStats';
import { IPOTimeline } from '../../components/details/IPOTimeline';
import { IPOLotInfo } from '../../components/details/IPOLotInfo';
import { IPOQuickActions } from '../../components/details/IPOQuickActions';

export const IPODetailsScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { user, token, refreshProfile, isAuthenticated } = useAuth();
    const { showAlert } = useUI();

    const item = route.params.item;
    const [loading, setLoading] = React.useState(false);

    // Initial check for item validity if needed
    React.useEffect(() => {
        if (!item) {
            navigation.goBack();
        }
    }, [item]);



    // Derived values
    const ipoId = item?._id || item?.id;
    const ipoType = (item?.type?.toLowerCase() as 'mainboard' | 'sme') || 'mainboard';

    // Fetch fresh details
    const { data: fetchedItem, isLoading: isFetching, refetch } = useGetIPODetailsQuery({
        id: ipoId,
        type: ipoType
    }, {
        skip: !ipoId
    });

    // Use fetched item if available, otherwise fallback to nav param
    const displayItem = fetchedItem || item;
    const isLoading = loading || isFetching;



    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const [localIsWatchlisted, setLocalIsWatchlisted] = useState(false);
    const toggleCount = useRef(0);

    useEffect(() => {
        if (user?.watchlist && toggleCount.current === 0) {
            setLocalIsWatchlisted(user.watchlist.includes(ipoId));
        }
    }, [user?.watchlist, ipoId]);

    const syncWatchlist = useCallback(
        debounce(async (currentToken: string, currentId: string) => {
            if (toggleCount.current % 2 !== 0) {
                try {
                    await toggleWatchlist(currentToken, currentId);
                    await refreshProfile();
                } catch (error) {
                    console.error("Watchlist sync failed", error);
                    setLocalIsWatchlisted(prev => !prev);
                    showAlert({ title: "Error", message: "Failed to update watchlist", type: 'error' });
                }
            }
            toggleCount.current = 0;
        }, 800),
        []
    );

    const handleOpenPdf = (url: string, title: string) => {
        if (!url) {
            showAlert({ title: 'Error', message: 'URL not available', type: 'error' });
            return;
        }

        let finalUrl = url;
        if (Platform.OS === 'android') {
            finalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
        }

        navigation.navigate('NewsViewer', { url: finalUrl, title: title });
    };

    const handleToggleWatchlist = () => {
        if (!isAuthenticated || !token) {
            showAlert({
                title: "Login Required",
                message: "Please login to add to watchlist",
                type: 'info',
                buttons: [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate("Root", { screen: "Profile" }) }
                ]
            });
            return;
        }
        setLocalIsWatchlisted(prev => !prev);
        toggleCount.current += 1;
        syncWatchlist(token, ipoId);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>IPO Details</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleToggleWatchlist} style={styles.closeBtn}>
                        <Heart
                            color={localIsWatchlisted ? "#E91E63" : colors.text}
                            fill={localIsWatchlisted ? "#E91E63" : "transparent"}
                            size={24}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading || !displayItem ? (
                <SkeletonDetail />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                >
                    <IPOHero item={displayItem!} />

                    <IPOStats item={displayItem!} />

                    <IPOTimeline item={displayItem!} />

                    <IPOLotInfo item={displayItem!} />

                    <IPOQuickActions
                        item={displayItem!}
                        onOpenPdf={handleOpenPdf}
                        onShowAlert={showAlert}
                    />
                </ScrollView>
            )}

            {/* Floating Action Button for Allotment - Only for Closed/Listed IPOs */}
            {!isLoading && displayItem && displayItem.status === 'Closed' && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.fab,
                            {
                                backgroundColor: displayItem.isAllotmentOut ? colors.primary : '#333333',
                                opacity: 1,
                                shadowColor: displayItem.isAllotmentOut ? colors.primary : "#000",
                                shadowOpacity: displayItem.isAllotmentOut ? 0.6 : 0.3,
                                shadowRadius: displayItem.isAllotmentOut ? 12 : 8,
                            }
                        ]}
                        activeOpacity={0.8}
                        disabled={false}
                        onPress={async () => {
                            if (!displayItem) return;

                            const hasRegistrar = (displayItem.registrarName && displayItem.registrarName !== "N/A") || (displayItem.registrarLink && displayItem.registrarLink !== "");

                            if (!hasRegistrar) {
                                showAlert({
                                    title: "Registrar Not Assigned",
                                    message: "The registrar for this IPO has not been assigned yet. Please check back later.",
                                    type: 'info'
                                });
                                return;
                            }

                            if (!displayItem.isAllotmentOut) {
                                showAlert({
                                    title: "Allotment Not Out",
                                    message: "The allotment status for this IPO has not been announced yet. Please check back later!",
                                    type: 'info'
                                });
                                return;
                            }

                            // Check if user has ANY PANs (Local or Cloud)
                            let hasPans = false;
                            try {
                                const storedLocal = await AsyncStorage.getItem('unsaved_pans');
                                if (storedLocal && JSON.parse(storedLocal).length > 0) hasPans = true;

                                if (!hasPans && isAuthenticated && user?.panDocuments?.length > 0) {
                                    hasPans = true;
                                }
                            } catch (e) { console.error(e); }

                            if (hasPans) {
                                navigation.navigate('AllotmentResult', { ipo: displayItem });
                            } else {
                                showAlert({
                                    title: "No PANs Found",
                                    message: "Please add at least one PAN in your Profile to check allotment.",
                                    type: 'info',
                                    buttons: [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Add PAN", onPress: () => navigation.navigate("Root", { screen: "PANs" }) }
                                    ]
                                });
                            }
                        }}
                    >
                        <CheckCircle color={(displayItem.isAllotmentOut && ((displayItem.registrarName && displayItem.registrarName !== "N/A") || (displayItem.registrarLink && displayItem.registrarLink !== ""))) ? "#FFF" : "#888"} size={22} strokeWidth={2.5} />
                        <Text style={[styles.fabText, { color: (displayItem.isAllotmentOut && ((displayItem.registrarName && displayItem.registrarName !== "N/A") || (displayItem.registrarLink && displayItem.registrarLink !== ""))) ? "#FFF" : "#888" }]}>
                            {displayItem.isAllotmentOut ? "CHECK ALLOTMENT NOW" : "CHECK ALLOTMENT"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        opacity: 1,
    },
    content: {
        paddingBottom: 100,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
        marginVertical: 4,
        opacity: 0.5,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
    },
    fab: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28, // Pill shape
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    fabText: {
        fontWeight: '800', // Extra bold
        fontSize: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
});

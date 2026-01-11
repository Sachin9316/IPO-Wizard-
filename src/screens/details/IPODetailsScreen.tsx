import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { ArrowLeft, CheckCircle, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { toggleWatchlist } from '../../services/api';
import { useLazyGetIPODetailsQuery } from '../../services/ipoApi';
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
    const itemParam: IPOData = route.params.item;
    const [item, setItem] = useState<IPOData>(itemParam);
    const [loading, setLoading] = React.useState(true);

    const [triggerDetails] = useLazyGetIPODetailsQuery();

    const ipoId = item._id || item.id;

    React.useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            try {
                let fullDetails = null;
                if (itemParam.type === 'SME') {
                    fullDetails = await triggerDetails({ id: ipoId, type: 'sme' }).unwrap();
                } else {
                    fullDetails = await triggerDetails({ id: ipoId, type: 'mainboard' }).unwrap();
                }

                if (isMounted && fullDetails) {
                    setItem(prev => ({ ...prev, ...fullDetails }));
                }
            } catch (error) {
                console.error("Failed to fetch IPO details", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetails();

        return () => { isMounted = false; };
    }, [ipoId, itemParam.type]);

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

            {loading ? (
                <SkeletonDetail />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <IPOHero item={item} />

                    <IPOStats item={item} />

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <IPOTimeline item={item} />

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <IPOLotInfo item={item} />

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <IPOQuickActions
                        item={item}
                        onOpenPdf={handleOpenPdf}
                        onShowAlert={showAlert}
                    />
                </ScrollView>
            )}

            {/* Floating Action Button for Allotment - Only for Closed/Listed IPOs */}
            {!loading && item.status === 'Closed' && (
                <TouchableOpacity
                    style={[
                        styles.fab,
                        {
                            backgroundColor: item.isAllotmentOut ? colors.primary : '#333333',
                            opacity: 1 // Always fully visible opacity-wise, just specialized color
                        }
                    ]}
                    disabled={false}
                    onPress={async () => {
                        const hasRegistrar = (item.registrarName && item.registrarName !== "N/A") || (item.registrarLink && item.registrarLink !== "");

                        if (!hasRegistrar) {
                            showAlert({
                                title: "Registrar Not Assigned",
                                message: "The registrar for this IPO has not been assigned yet. Please check back later.",
                                type: 'info'
                            });
                            return;
                        }

                        if (!item.isAllotmentOut) {
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
                            navigation.navigate('AllotmentResult', { ipo: item });
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
                    <CheckCircle color={(item.isAllotmentOut && ((item.registrarName && item.registrarName !== "N/A") || (item.registrarLink && item.registrarLink !== ""))) ? "#FFF" : "#888"} size={20} />
                    <Text style={[styles.fabText, { color: (item.isAllotmentOut && ((item.registrarName && item.registrarName !== "N/A") || (item.registrarLink && item.registrarLink !== ""))) ? "#FFF" : "#888" }]}>Check Allotment</Text>
                </TouchableOpacity>
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
    fab: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        gap: 12,
    },
    fabText: {
        fontWeight: '700',
        fontSize: 16,
    },
});

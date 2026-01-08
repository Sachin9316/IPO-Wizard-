import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { ArrowLeft, Calendar, CheckCircle, FileText, TrendingUp, Users, Heart, Info, IndianRupee, Layers, PieChart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { toggleWatchlist } from '../../services/api';
import { SkeletonDetail } from '../../components/SkeletonDetail';
import { useUI } from '../../context/UIContext';
import moment from 'moment';

export const IPODetailsScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { user, token, refreshProfile, isAuthenticated } = useAuth();
    const { showAlert } = useUI();
    const item: IPOData = route.params.item;
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const ipoId = item._id || item.id;
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
        // Check if URL is a PDF and we are on Android, wrap with Google Docs Viewer
        // Using a simple check for .pdf extension or if user explicitly knows it's a PDF
        // Ideally checking headers is better but for now this suffices as per requirement
        if (Platform.OS === 'android') {
            finalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
        }

        // Navigation to NewsViewer which is essentially a generic WebView viewer
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

    // Dynamic Timeline Logic
    const getStepStatus = (rawDateStr: string | undefined, isOfferEnd = false) => {
        if (!rawDateStr) return 'future';
        const now = moment();
        const targetDate = moment(rawDateStr);

        if (isOfferEnd) {
            const startDate = moment(item.rawDates?.offerStart);
            if (now.isBetween(startDate, targetDate, 'day', '[]')) return 'active';
            if (now.isAfter(targetDate, 'day')) return 'completed';
            return 'future';
        }

        if (now.isSame(targetDate, 'day')) return 'active';
        if (now.isAfter(targetDate, 'day')) return 'completed';
        return 'future';
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
                    {/* Refined Hero Header */}
                    {/* Refined Hero Header */}
                    <View style={styles.compactHeader}>
                        <View style={styles.heroContainer}>
                            <View style={styles.logoContainerLarge}>
                                {item.logoUrl ? (
                                    <Image source={{ uri: item.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                                ) : (
                                    <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
                                )}
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={[styles.companyNameLarge, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                                <View style={styles.badgesRow}>
                                    <View style={[styles.badgePill, { borderColor: colors.primary, paddingVertical: 2, paddingHorizontal: 6 }]}>
                                        <Text style={[styles.badgeText, { color: colors.primary, fontSize: 10 }]}>{item.type}</Text>
                                    </View>
                                    <View style={[styles.badgePill, { borderColor: item.status === 'Open' ? '#4CAF50' : '#888', paddingVertical: 2, paddingHorizontal: 6 }]}>
                                        <Text style={[styles.badgeText, { color: item.status === 'Open' ? '#4CAF50' : '#888', fontSize: 10 }]}>{item.status}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Icon-based Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatusBarItem
                            icon={<Calendar size={16} color={colors.text} opacity={0.6} />}
                            label="Offer Dates"
                            value={`${moment(item.rawDates?.offerStart).format('DD MMM')} - ${moment(item.rawDates?.offerEnd).format('DD MMM')}`}
                            colors={colors}
                        />
                        <StatusBarItem
                            icon={<IndianRupee size={16} color={colors.text} opacity={0.6} />}
                            label="Price Range"
                            value={item.priceRange}
                            colors={colors}
                        />
                        <StatusBarItem
                            icon={<Layers size={16} color={colors.text} opacity={0.6} />}
                            label="Lot Size"
                            value={item.lotSize}
                            colors={colors}
                        />
                        <StatusBarItem
                            icon={<PieChart size={16} color={colors.text} opacity={0.6} />}
                            label="Issue Size"
                            value={item.issueSize}
                            colors={colors}
                        />
                        <StatusBarItem
                            icon={<TrendingUp size={16} color={item.gmp?.includes('+') ? '#4CAF50' : colors.text} opacity={0.8} />}
                            label="GMP"
                            value={item.gmp}
                            valueColor={item.gmp?.includes('+') ? '#4CAF50' : undefined}
                            colors={colors}
                        />
                        <StatusBarItem
                            icon={<Users size={16} color={colors.text} opacity={0.6} />}
                            label="Subs."
                            value={item.subscription}
                            colors={colors}
                        />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Timeline (Horizontal) */}
                    <View style={styles.sectionCompact}>
                        <Text style={[styles.sectionTitleCompact, { color: colors.text }]}>Timeline</Text>
                        <View style={styles.horizontalTimeline}>
                            <HorizontalStep label="Open" date={moment(item.rawDates?.offerStart).format('DD MMM')} status={getStepStatus(item.rawDates?.offerStart)} colors={colors} isFirst />
                            <HorizontalStep label="Close" date={moment(item.rawDates?.offerEnd).format('DD MMM')} status={getStepStatus(item.rawDates?.offerEnd, true)} colors={colors} />
                            <HorizontalStep label="Allotment" date={moment(item.rawDates?.allotment).format('DD MMM')} status={getStepStatus(item.rawDates?.allotment)} colors={colors} />
                            <HorizontalStep label="Listing" date={moment(item.rawDates?.listing).format('DD MMM')} status={getStepStatus(item.rawDates?.listing)} colors={colors} isLast />
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Compact Lot Details */}
                    <View style={styles.sectionCompact}>
                        <Text style={[styles.sectionTitleCompact, { color: colors.text }]}>Min Investment</Text>
                        <View style={styles.verticalLotList}>
                            {/* Full Logic restored as Vertical List */}
                            {(() => {
                                const lotSizeNum = parseInt(item.lotSize);
                                const lotAmount = (item.maxPrice || 0) * lotSizeNum;
                                if (!lotAmount) return null;
                                const isSME = item.type === 'SME';

                                if (isSME) {
                                    return (
                                        <>
                                            <LotRow label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                                            <LotRow label="HNI (Min)" lots={2} shares={lotSizeNum * 2} amount={lotAmount * 2} colors={colors} isLast />
                                        </>
                                    );
                                }

                                const retailMaxLots = Math.floor(200000 / lotAmount);
                                const shniMinLots = retailMaxLots + 1;
                                const shniMaxLots = Math.floor(1000000 / lotAmount);
                                const bhniMinLots = shniMaxLots + 1;

                                return (
                                    <>
                                        <LotRow label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                                        <LotRow label="Retail (Max)" lots={retailMaxLots} shares={lotSizeNum * retailMaxLots} amount={lotAmount * retailMaxLots} colors={colors} />
                                        <LotRow label="sNII (Min)" lots={shniMinLots} shares={lotSizeNum * shniMinLots} amount={lotAmount * shniMinLots} colors={colors} />
                                        <LotRow label="sNII (Max)" lots={shniMaxLots} shares={lotSizeNum * shniMaxLots} amount={lotAmount * shniMaxLots} colors={colors} />
                                        <LotRow label="bNII (Min)" lots={bhniMinLots} shares={lotSizeNum * bhniMinLots} amount={lotAmount * bhniMinLots} colors={colors} isLast />
                                    </>
                                );
                            })()}
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Quick Actions */}
                    <View style={styles.sectionCompact}>
                        <Text style={[styles.sectionTitleCompact, { color: colors.text, marginBottom: 12 }]}>Quick Actions</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.actionsRow}
                        >
                            {/* Essential Documents */}
                            {item.rhpUrl && (
                                <ActionIconButton
                                    icon={<FileText size={24} color={colors.primary} />}
                                    label="RHP PDF"
                                    backgroundColor={colors.card}
                                    borderColor={colors.border}
                                    onPress={() => handleOpenPdf(item.rhpUrl!, 'RHP Document')}
                                />
                            )}
                            {item.drhpUrl && (
                                <ActionIconButton
                                    icon={<FileText size={24} color={colors.text} />}
                                    label="DRHP PDF"
                                    backgroundColor={colors.card}
                                    borderColor={colors.border}
                                    onPress={() => handleOpenPdf(item.drhpUrl!, 'DRHP Document')}
                                />
                            )}

                            {/* Live Subscription */}
                            <ActionIconButton
                                icon={<TrendingUp size={24} color="#4CAF50" />}
                                label="Live Subs"
                                backgroundColor={colors.card}
                                borderColor={colors.border}
                                onPress={() => {
                                    if (item.subscriptionDetails) {
                                        navigation.navigate('SubscriptionStatus', { ipo: item });
                                    } else {
                                        showAlert({ title: 'Info', message: 'Subscription data not available yet', type: 'info' });
                                    }
                                }}
                            />

                            {/* GMP Trend */}
                            <ActionIconButton
                                icon={<TrendingUp size={24} color="#FF9800" />}
                                label="GMP Trend"
                                backgroundColor={colors.card}
                                borderColor={colors.border}
                                onPress={() => {
                                    if (item.gmpDetails && item.gmpDetails.length > 0) {
                                        navigation.navigate('GMPStatus', { ipo: item });
                                    } else {
                                        showAlert({ title: 'Info', message: 'GMP data not available yet', type: 'info' });
                                    }
                                }}
                            />

                            {/* Allotment Status removed from here, moved to FAB */}
                        </ScrollView>
                    </View>
                </ScrollView>
            )}

            {/* Floating Action Button for Allotment */}
            {!loading && (
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
                    <CheckCircle color={item.isAllotmentOut ? "#FFF" : "#888"} size={20} />
                    <Text style={[styles.fabText, { color: item.isAllotmentOut ? "#FFF" : "#888" }]}>Check Allotment</Text>
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
    headerTitle: { // We might hide this as it's redundant with hero, or keep small
        fontSize: 22,
        fontWeight: 'bold',
        opacity: 1,
    },
    content: {
        paddingBottom: 100,
    },
    // Compact Header Styles
    compactHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    // Refined Hero Styles
    heroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: 16,
    },
    logoContainerLarge: {
        width: 56,
        height: 56,
        borderRadius: 14,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logoLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    companyNameLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgePill: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
        justifyContent: 'space-between', // Try to space them out
    },
    statusBarItem: {
        width: '48%', // 2 per row looks cleaner with icons
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)', // Very subtle card bg for stats
        padding: 10,
        borderRadius: 12,
        gap: 10,
    },
    statContent: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.5,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
        marginVertical: 4,
        opacity: 0.5,
    },
    sectionCompact: {
        padding: 16,
    },
    sectionTitleCompact: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },
    // Horizontal Timeline
    horizontalTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hStep: {
        alignItems: 'center',
        flex: 1,
    },
    hStepCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 4,
    },
    hStepLine: {
        position: 'absolute',
        top: 4,
        left: '50%',
        width: '100%',
        height: 2,
        zIndex: -1,
    },
    hLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 2
    },
    hDate: {
        fontSize: 9,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.6
    },
    // Lot Row
    compactLotRow: {
        paddingRight: 16,
        gap: 8,
    },
    verticalLotList: {
        paddingTop: 8,
    },
    lotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    lotRowLeft: {
        flexDirection: 'column',
    },
    lotRowRight: {
        alignItems: 'flex-end',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
        paddingRight: 16,
    },
    actionIconButton: {
        alignItems: 'center',
        gap: 6,
        width: 65,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
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

const StatusBarItem = ({ label, value, valueColor, colors, icon }: any) => (
    <View style={styles.statusBarItem}>
        {icon}
        <View style={styles.statContent}>
            <Text style={[styles.statusLabel, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.statusValue, { color: valueColor || colors.text }]} numberOfLines={1}>{value || '-'}</Text>
        </View>
    </View>
);

const HorizontalStep = ({ label, date, status, colors, isFirst, isLast }: any) => {
    const isActive = status === 'active';
    const isCompleted = status === 'completed';
    // Logic for line: if this is NOT the last item, show line to right
    // Color of line depends on if this step is completed? Strictly speaking, line connects two steps. 
    // Simplified: if current is completed, line is green?

    return (
        <View style={styles.hStep}>
            <View style={[styles.hStepCircle, { backgroundColor: isActive ? colors.primary : isCompleted ? '#4CAF50' : colors.border }]} />
            {!isLast && (
                <View style={[styles.hStepLine, { backgroundColor: isCompleted ? '#4CAF50' : colors.border, left: '50%', width: '100%' }]} />
            )}
            {/* We need lines between steps. The simple absolute position above draws line to right. */}
            <Text style={[styles.hLabel, { color: colors.text, opacity: status === 'future' ? 0.5 : 1 }]}>{label}</Text>
            <Text style={[styles.hDate, { color: colors.text }]}>{date}</Text>
        </View>
    );
}

const ActionIconButton = ({ icon, label, backgroundColor, borderColor, onPress }: any) => (
    <TouchableOpacity style={styles.actionIconButton} onPress={onPress}>
        <View style={[
            styles.iconCircle,
            {
                backgroundColor: backgroundColor,
                borderWidth: borderColor ? 1 : 0,
                borderColor: borderColor || 'transparent',
            }
        ]}>
            {icon}
        </View>
        <Text style={[styles.actionLabel, { color: '#666' }]}>{label}</Text>
    </TouchableOpacity>
);

const LotRow = ({ label, lots, shares, amount, colors, isLast }: any) => {
    return (
        <View style={[styles.lotRow, isLast && { borderBottomWidth: 0 }, { borderBottomColor: colors.border }]}>
            <View style={styles.lotRowLeft}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{label}</Text>
                <Text style={{ fontSize: 11, color: colors.text, opacity: 0.5, marginTop: 2 }}>{lots} Lot • {shares} Shares</Text>
            </View>
            <View style={styles.lotRowRight}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>₹{amount.toLocaleString('en-IN')}</Text>
            </View>
        </View>
    );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { ArrowLeft, Calendar, CheckCircle, FileText, TrendingUp, Users, Heart, ArrowLeftRight, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { toggleWatchlist } from '../../services/api';
import { SkeletonDetail } from '../../components/SkeletonDetail';
import { IPOSelectionModal } from '../../components/IPOSelectionModal';
import { useUI } from '../../context/UIContext';
import moment from 'moment';

export const IPODetailsScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { user, token, refreshProfile, isAuthenticated } = useAuth();
    const { showAlert } = useUI();
    const item: IPOData = route.params.item;
    const [loading, setLoading] = React.useState(true);
    const [showSelectionModal, setShowSelectionModal] = React.useState(false);

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
                <Text style={[styles.headerTitle, { color: colors.text }]}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => setShowSelectionModal(true)}
                        style={[styles.closeBtn, { marginRight: 8 }]}
                    >
                        <ArrowLeftRight color={colors.text} size={24} />
                    </TouchableOpacity>
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
                    {/* Compact Hero Header */}
                    <View style={styles.compactHeader}>
                        <View style={styles.headerTopRow}>
                            <View style={[styles.logoContainerCompact, { borderColor: colors.border }]}>
                                {item.logoUrl ? (
                                    <Image source={{ uri: item.logoUrl }} style={styles.logoCompact} resizeMode="contain" />
                                ) : (
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
                                )}
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={[styles.companyNameCompact, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>

                                    <Text style={[styles.tagTextCompact, { color: colors.primary }]}>{item.type}</Text>
                                    <View style={[styles.dotSeparator, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.tagTextCompact, { color: item.status === 'Open' ? '#4CAF50' : '#888' }]}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Compact Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatusBarItem label="Offer Dates" value={`${moment(item.rawDates?.offerStart).format('DD MMM')} - ${moment(item.rawDates?.offerEnd).format('DD MMM')}`} colors={colors} />
                        <StatusBarItem label="Price Range" value={`₹${item.priceRange}`} colors={colors} />
                        <StatusBarItem label="Issue Size" value={item.issueSize} colors={colors} />
                        <StatusBarItem label="Lot Size" value={item.lotSize} colors={colors} />
                        <StatusBarItem label="GMP" value={item.gmp} valueColor={item.gmp?.includes('+') ? '#4CAF50' : undefined} colors={colors} />
                        <StatusBarItem label="Subs." value={item.subscription} colors={colors} />
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
                                    onPress={() => Linking.openURL(item.rhpUrl!).catch(err => showAlert({ title: 'Error', message: 'Could not open link', type: 'error' }))}
                                />
                            )}
                            {item.drhpUrl && (
                                <ActionIconButton
                                    icon={<FileText size={24} color={colors.text} />}
                                    label="DRHP PDF"
                                    backgroundColor={colors.card}
                                    borderColor={colors.border}
                                    onPress={() => Linking.openURL(item.drhpUrl!).catch(err => showAlert({ title: 'Error', message: 'Could not open link', type: 'error' }))}
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

                            {/* Allotment Status */}
                            <ActionIconButton
                                icon={<CheckCircle size={24} color={item.isAllotmentOut ? "#2196F3" : colors.text} />}
                                label="Allotment"
                                backgroundColor={colors.card}
                                borderColor={colors.border}
                                onPress={async () => {
                                    if (!item.isAllotmentOut) {
                                        showAlert({ title: 'Info', message: 'Allotment is not out yet.', type: 'info' });
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
                            />
                        </ScrollView>
                    </View>
                </ScrollView>
            )}

            <IPOSelectionModal
                visible={showSelectionModal}
                onClose={() => setShowSelectionModal(false)}
                onSelect={(ipo2) => {
                    setShowSelectionModal(false);
                    navigation.navigate('Comparison', { ipo1: item, ipo2 });
                }}
                currentItemId={ipoId}
            />
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
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: { // We might hide this as it's redundant with hero, or keep small
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0, // Hidden initially? or just transparent
    },
    content: {
        paddingBottom: 40,
    },
    // Compact Header Styles
    compactHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainerCompact: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoCompact: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    companyNameCompact: {
        fontSize: 18,
        fontWeight: '700',
    },
    companySymbolCompact: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.6,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    tagTextCompact: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    statusBarItem: {
        width: '30%', // roughly 3 per row
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '500',
        opacity: 0.6,
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
});

const StatusBarItem = ({ label, value, valueColor, colors }: any) => (
    <View style={styles.statusBarItem}>
        <Text style={[styles.statusLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.statusValue, { color: valueColor || colors.text }]}>{value || '-'}</Text>
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

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
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={[styles.heroBackground, { backgroundColor: colors.primary + '10' }]} />
                        <View style={styles.heroContent}>
                            <View style={[styles.logoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {item.logoUrl ? (
                                    <Image source={{ uri: item.logoUrl }} style={styles.logo} resizeMode="contain" />
                                ) : (
                                    <View style={styles.logoPlaceholder}><Text style={{ color: colors.text, fontSize: 10, opacity: 0.5 }}>LOGO</Text></View>
                                )}
                            </View>
                            <View style={styles.heroText}>
                                <Text style={[styles.companySymbol, { color: colors.primary }]}>{item.symbol || 'IPO'}</Text>
                                <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                                <View style={styles.tagRow}>
                                    <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.tagText, { color: colors.primary }]}>{item.type}</Text>
                                    </View>
                                    <View style={[styles.statusTag, { backgroundColor: item.status === 'Open' ? '#4CAF5020' : '#88888820' }]}>
                                        <Text style={[styles.statusTagText, { color: item.status === 'Open' ? '#4CAF50' : '#888' }]}>{item.status}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats Bento Grid */}
                    <View style={styles.bentoSection}>
                        <View style={styles.bentoRow}>
                            <BentoBox
                                label="Listing Date"
                                value={item.dates.listing}
                                icon={<Calendar size={18} color="#FF9800" />}
                                colors={colors}
                            />
                            <BentoBox
                                label="Gray Market Pr."
                                value={item.gmp}
                                icon={<TrendingUp size={18} color="#4CAF50" />}
                                colors={colors}
                            />
                        </View>
                        <View style={styles.bentoRow}>
                            <BentoBox
                                label="Min. Investment"
                                customValue={
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={[styles.bentoValue, { color: colors.text, fontSize: 18, fontWeight: '800' }]}>
                                            ₹{item.maxPrice ? Math.floor(item.maxPrice * parseInt(item.lotSize)).toLocaleString('en-IN') : '-'}
                                        </Text>
                                        <Text style={{ fontSize: 12, opacity: 0.5, marginLeft: 2 }}>/{item.lotSize} sh.</Text>
                                    </View>
                                }
                                labelColor="#2196F3"
                                colors={colors}
                            />
                            <BentoBox
                                label="Subscription"
                                value={item.subscription}
                                icon={<Users size={18} color="#9C27B0" />}
                                colors={colors}
                            />
                        </View>
                    </View>

                    {/* Lot Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lot Details</Text>
                            <Info size={16} color={colors.text} opacity={0.5} />
                        </View>
                        <View style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {(() => {
                                const lotSizeNum = parseInt(item.lotSize);
                                const lotAmount = (item.maxPrice || 0) * lotSizeNum;
                                if (!lotAmount) return null;

                                const isSME = item.type === 'SME';

                                if (isSME) {
                                    return (
                                        <>
                                            <CategoryItem label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                                            <CategoryItem label="HNI (Min)" lots={2} shares={lotSizeNum * 2} amount={lotAmount * 2} colors={colors} isLast />
                                        </>
                                    );
                                }

                                const retailMaxLots = Math.floor(200000 / lotAmount);
                                const shniMinLots = retailMaxLots + 1;
                                const shniMaxLots = Math.floor(1000000 / lotAmount);
                                const bhniMinLots = shniMaxLots + 1;

                                return (
                                    <>
                                        <CategoryItem label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                                        <CategoryItem label="Retail (Max)" lots={retailMaxLots} shares={lotSizeNum * retailMaxLots} amount={lotAmount * retailMaxLots} colors={colors} />
                                        <CategoryItem label="sNII (Min)" lots={shniMinLots} shares={lotSizeNum * shniMinLots} amount={lotAmount * shniMinLots} colors={colors} />
                                        <CategoryItem label="sNII (Max)" lots={shniMaxLots} shares={lotSizeNum * shniMaxLots} amount={lotAmount * shniMaxLots} colors={colors} />
                                        <CategoryItem label="bNII (Min)" lots={bhniMinLots} shares={lotSizeNum * bhniMinLots} amount={lotAmount * bhniMinLots} colors={colors} isLast />
                                    </>
                                );
                            })()}
                        </View>
                    </View>

                    {/* Timeline Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>IPO Timeline</Text>
                        <View style={[styles.timelineContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TimelineStep
                                label="Offer Period"
                                date={`${item.dates.offerStart} - ${item.dates.offerEnd}`}
                                status={getStepStatus(item.rawDates?.offerEnd, true)}
                                colors={colors}
                            />
                            <TimelineStep
                                label="Allotment Date"
                                date={item.dates.allotment}
                                status={getStepStatus(item.rawDates?.allotment)}
                                colors={colors}
                            />
                            <TimelineStep
                                label="Refund Initiation"
                                date={item.dates.refund}
                                status={getStepStatus(item.rawDates?.refund)}
                                colors={colors}
                            />
                            <TimelineStep
                                label="Listing on Exchange"
                                date={item.dates.listing}
                                status={getStepStatus(item.rawDates?.listing)}
                                isLast
                                colors={colors}
                            />
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Quick Actions</Text>
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

const ActionIconButton = ({ icon, label, backgroundColor, borderColor, onPress }: any) => (
    <TouchableOpacity style={styles.actionIconButton} onPress={onPress}>
        <View style={[
            styles.iconCircle,
            {
                backgroundColor: backgroundColor,
                borderWidth: borderColor ? 1.5 : 0,
                borderColor: borderColor || 'transparent',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            }
        ]}>
            {icon}
        </View>
        <Text style={[styles.actionLabel, { color: '#666' }]}>{label}</Text>
    </TouchableOpacity>
);

const BentoBox = ({ label, value, customValue, icon, colors, labelColor }: any) => (
    <View style={[styles.bentoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.bentoHeader}>
            <Text style={[styles.bentoLabel, { color: labelColor || colors.text, opacity: labelColor ? 1 : 0.6 }]}>{label}</Text>
            {icon}
        </View>
        {customValue || <Text style={[styles.bentoValue, { color: colors.text }]}>{value}</Text>}
    </View>
);

const TimelineStep = ({ label, date, isLast, status, colors }: any) => {
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
        <View style={[styles.timelineRow, { marginBottom: 12 }]}>
            <View style={styles.timelineLeft}>
                <View style={[
                    styles.timelineDot,
                    {
                        backgroundColor: isActive ? colors.primary : isCompleted ? '#4CAF50' : colors.border,
                        transform: [{ scale: isActive ? 1.2 : 1 }]
                    }
                ]} />
                {!isLast && (
                    <View style={[
                        styles.timelineLine,
                        { backgroundColor: isCompleted ? '#4CAF50' : colors.border }
                    ]} />
                )}
            </View>
            <View style={styles.timelineRight}>
                <Text style={[
                    styles.timelineStepLabel,
                    {
                        color: colors.text,
                        fontWeight: isActive ? '700' : '500',
                        opacity: status === 'future' ? 0.6 : 1
                    }
                ]}>
                    {label}
                </Text>
                <Text style={[styles.timelineStepDate, { color: colors.text, opacity: 0.6 }]}>{date}</Text>
            </View>
        </View>
    );
};

const CategoryItem = ({ label, lots, shares, amount, colors, isLast }: any) => (
    <View style={[styles.categoryItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1.5 }}>
            <Text style={[styles.categoryLabel, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.categorySubLabel, { color: colors.text, opacity: 0.6 }]}>{lots} Lot / {shares} Shares</Text>
        </View>
        <Text style={[styles.categoryAmount, { color: colors.text }]}>₹{amount.toLocaleString('en-IN')}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        paddingBottom: 40,
    },
    heroSection: {
        padding: 24,
        paddingTop: 12,
        marginBottom: 8,
    },
    heroBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logo: {
        width: '70%',
        height: '70%',
    },
    logoPlaceholder: {
        alignItems: 'center',
    },
    heroText: {
        flex: 1,
    },
    companySymbol: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 10,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    bentoSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    bentoBox: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        justifyContent: 'space-between',
        minHeight: 90,
    },
    bentoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bentoLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    bentoValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    categoryCard: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    categorySubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    categoryAmount: {
        fontSize: 15,
        fontWeight: '800',
    },
    timelineContainer: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
    },
    timelineRow: {
        flexDirection: 'row',
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 20,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    timelineRight: {
        paddingBottom: 12,
        flex: 1,
    },
    timelineStepLabel: {
        fontSize: 15,
        marginBottom: 4,
    },
    timelineStepDate: {
        fontSize: 13,
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
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
});

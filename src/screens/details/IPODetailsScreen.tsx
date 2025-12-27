import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { ArrowLeft, Calendar, CheckCircle, FileText, TrendingUp, Users, Heart, ArrowLeftRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { toggleWatchlist } from '../../services/api';
import { SkeletonDetail } from '../../components/SkeletonDetail';
import { IPOSelectionModal } from '../../components/IPOSelectionModal';
import { useUI } from '../../context/UIContext';

export const IPODetailsScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { user, token, refreshProfile, isAuthenticated } = useAuth();
    const { showAlert } = useUI();
    const item: IPOData = route.params.item;
    const [loading, setLoading] = React.useState(true);
    const [showSelectionModal, setShowSelectionModal] = React.useState(false);

    React.useEffect(() => {
        // Smooth transition effect
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);
    const ipoId = item._id || item.id; // Fallback to id if _id missing (dummy data)

    // const isWatchlisted declaration removed as it is replaced by localIsWatchlisted

    const [localIsWatchlisted, setLocalIsWatchlisted] = useState(false);
    const toggleCount = useRef(0);

    // Initialize/Sync local state with user data
    useEffect(() => {
        if (user?.watchlist && toggleCount.current === 0) {
            setLocalIsWatchlisted(user.watchlist.includes(ipoId));
        }
    }, [user?.watchlist, ipoId]);

    // Debounced API call
    const syncWatchlist = useCallback(
        debounce(async (currentToken: string, currentId: string) => {
            if (toggleCount.current % 2 !== 0) {
                try {
                    await toggleWatchlist(currentToken, currentId);
                    await refreshProfile();
                } catch (error) {
                    console.error("Watchlist sync failed", error);
                    // Revert UI on failure
                    setLocalIsWatchlisted(prev => !prev);
                    showAlert({ title: "Error", message: "Failed to update watchlist", type: 'error' });
                }
            }
            // Reset counter after processing
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

        // Optimistic Update
        setLocalIsWatchlisted(prev => !prev);
        toggleCount.current += 1;

        // Trigger debounced sync
        syncWatchlist(token, ipoId);
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
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>IPO Details</Text>
                        <View style={[styles.detailRow, { backgroundColor: colors.card }]}>
                            <DetailItem label="Price Range" value={item.priceRange} colors={colors} />
                            <DetailItem label="Lot Size" value={item.lotSize} colors={colors} />
                        </View>
                        <View style={[styles.detailRow, { backgroundColor: colors.card, marginTop: 8 }]}>
                            <DetailItem label="Issue Size" value={item.issueSize} colors={colors} />
                            <DetailItem label="Subscription" value={item.subscription} colors={colors} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timelines</Text>
                        <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
                            <TimelineItem label="Offer Start" date={item.dates.offerStart} colors={colors} />
                            <TimelineItem label="Offer End" date={item.dates.offerEnd} colors={colors} />
                            <TimelineItem label="Allotment" date={item.dates.allotment} colors={colors} />
                            <TimelineItem label="Refund" date={item.dates.refund} colors={colors} />
                            <TimelineItem label="Listing" date={item.dates.listing} colors={colors} isLast />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                        <View style={styles.actionsGrid}>
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
                        </View>
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

const DetailItem = ({ label, value, colors }: any) => (
    <View style={styles.detailItem}>
        <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
)

const TimelineItem = ({ label, date, colors, isLast }: any) => (
    <View style={[styles.timelineItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.timelineLabel, { color: colors.text }]}>{label}</Text>
        </View>
        <Text style={[styles.timelineDate, { color: colors.text }]}>{date}</Text>
    </View>
)


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
)

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
        padding: 16,
        paddingBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timelineCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    timelineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    timelineLabel: {
        fontSize: 14,
    },
    timelineDate: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingVertical: 8,
    },
    actionIconButton: {
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});

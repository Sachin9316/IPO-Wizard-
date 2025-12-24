import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../data/dummyData';
import { X, Calendar, CheckCircle, FileText, TrendingUp, Users } from 'lucide-react-native';

export const IPODetailsScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const item: IPOData = route.params.item;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{item.name}</Text>
                <View style={{ width: 24 }} />
            </View>

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
                    <View style={styles.actionsContainer}>
                        <ActionIconButton
                            icon={<CheckCircle size={24} color="#fff" />}
                            label="Apply"
                            backgroundColor="#4CAF50"
                        />
                        <ActionIconButton
                            icon={<FileText size={24} color="#fff" />}
                            label="Application"
                            backgroundColor={colors.primary}
                        />
                        <ActionIconButton
                            icon={<TrendingUp size={24} color={colors.text} />}
                            label="Subscription"
                            backgroundColor={colors.card}
                            borderColor={colors.border}
                        />
                        <ActionIconButton
                            icon={<Users size={24} color={colors.text} />}
                            label="Allotment"
                            backgroundColor={colors.card}
                            borderColor={colors.border}
                        />
                    </View>
                </View>
            </ScrollView>
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


const ActionIconButton = ({ icon, label, backgroundColor, borderColor }: any) => (
    <TouchableOpacity style={styles.actionIconButton}>
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
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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

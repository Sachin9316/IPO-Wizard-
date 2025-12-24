import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../data/dummyData';
import { TrendingUp, Users, Calendar, CircleDollarSign } from 'lucide-react-native';

interface IPOCardProps {
    item: IPOData;
    onPress: (item: IPOData) => void;
}

export const IPOCard = ({ item, onPress }: IPOCardProps) => {
    const { colors } = useTheme();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return '#4CAF50';
            case 'Closed': return '#F44336';
            case 'Upcoming': return '#FF9800';
            default: return colors.text;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onPress(item)}
            activeOpacity={0.9}
        >
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    {item.logoUrl ? (
                        <View style={[styles.logoplaceholder, { backgroundColor: colors.border }]}>
                            {/* In real app, use Image here */}
                            <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>LOGO</Text>
                        </View>
                    ) : (
                        <View style={[styles.logoplaceholder, { backgroundColor: colors.border }]}>
                            <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>IMG</Text>
                        </View>
                    )}
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>

                        {item.status === 'Closed' && (
                            <View style={[styles.allotmentBadge, {
                                backgroundColor: item.isAllotmentOut ? '#E3F2FD' : '#FFF3E0'
                            }]}>
                                <Text style={[styles.allotmentText, {
                                    color: item.isAllotmentOut ? '#2196F3' : '#FF9800'
                                }]}>
                                    {item.isAllotmentOut ? 'ALLOTMENT OUT' : 'ALLOTMENT AWAITED'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.subtitleRow}>
                        <Text style={[styles.typeBadge, { color: colors.primary, borderColor: colors.primary }]}>{item.type}</Text>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statsContainer}>
                {/* Row 1: Price | GMP */}
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>PRICE RANGE</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.priceRange}</Text>
                    </View>
                    <View style={styles.statItemRight}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>GMP</Text>
                        <Text style={[styles.statValue, { color: '#4CAF50' }]}>{item.gmp}</Text>
                    </View>
                </View>

                {/* Row 2: Dates | Lot Size */}
                <View style={[styles.statRow, { marginTop: 12 }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>OFFER DATES</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.dates.offerStart} - {item.dates.offerEnd}</Text>
                    </View>
                    <View style={styles.statItemRight}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>LOT SIZE</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.lotSize} Shares</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    logoContainer: {
        marginRight: 12,
    },
    logoplaceholder: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    allotmentBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allotmentText: {
        fontSize: 9, // Slightly smaller font for longer text
        fontWeight: 'bold',
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeBadge: {
        fontSize: 10,
        fontWeight: '600',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginRight: 8,
        textTransform: 'uppercase',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        opacity: 0.5,
    },
    statsContainer: {
        padding: 16,
        paddingTop: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'flex-start',
    },
    statItemRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    statLabel: {
        fontSize: 10,
        opacity: 0.5,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../types/ipo';
import { TrendingUp, Users, Calendar, CircleDollarSign } from 'lucide-react-native';

interface IPOCardProps {
    item: IPOData;
    onPress: (item: IPOData) => void;
}

export const IPOCard = ({ item, onPress }: IPOCardProps) => {
    const { colors } = useTheme();
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
        setImageError(false);
    }, [item.logoUrl]);

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
                <View style={[styles.logoContainer, { width: 44, height: 44 }]}>
                    <View style={[styles.logoplaceholder, { backgroundColor: colors.border, position: 'absolute', width: '100%', height: '100%' }]}>
                        <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>LOGO</Text>
                    </View>
                    {item.logoUrl && !imageError && (
                        <Image
                            source={{ uri: item.logoUrl }}
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                            resizeMode="contain"
                            onError={() => setImageError(true)}
                        />
                    )}
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.subtitleRow}>
                                <Text style={[styles.typeBadge, { color: colors.primary, borderColor: colors.primary }]}>{item.type}</Text>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                            </View>
                        </View>

                        {/* GMP / Allotment on Top Right */}
                        <View style={{ alignItems: 'flex-end' }}>
                            {item.status === 'Closed' && item.isAllotmentOut ? (
                                <View style={[styles.allotmentBadge, { backgroundColor: '#E3F2FD', marginBottom: 4 }]}>
                                    <Text style={[styles.allotmentText, { color: '#2196F3' }]}>ALLOTMENT OUT</Text>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.gmpLabel, { color: colors.text, marginBottom: 0 }]}>GMP</Text>
                                    <Text style={[styles.gmpValue, { color: '#4CAF50' }]}>{item.gmp}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statsContainer}>
                {/* Single Row: Dates | Price | Lot */}
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>OFFER DATES</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.dates.offerStart}-{item.dates.offerEnd}</Text>
                    </View>

                    {/* Vertical Divider */}
                    <View style={{ width: 1, height: '80%', backgroundColor: colors.border, marginHorizontal: 8 }} />

                    <View style={[styles.statItem, { alignItems: 'center' }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>PRICE RANGE</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.priceRange}</Text>
                    </View>

                    {/* Vertical Divider */}
                    <View style={{ width: 1, height: '80%', backgroundColor: colors.border, marginHorizontal: 8 }} />

                    <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>LOT SIZE</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{item.lotSize}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        padding: 12,
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
        alignItems: 'flex-start', // Align to top
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    allotmentBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allotmentText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeBadge: {
        fontSize: 9,
        fontWeight: '600',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginRight: 6,
        textTransform: 'uppercase',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        opacity: 0.5,
    },
    statsContainer: {
        padding: 12,
        paddingVertical: 10,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        // alignItems set inline
    },
    statLabel: {
        fontSize: 9,
        opacity: 0.6,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    gmpLabel: {
        fontSize: 9,
        opacity: 0.6,
        fontWeight: '600',
    },
    gmpValue: {
        fontSize: 16,
        fontWeight: '700',
    }
});

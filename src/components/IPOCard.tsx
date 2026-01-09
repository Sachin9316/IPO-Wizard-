import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../types/ipo';
import { TrendingUp, Users, Calendar, CircleDollarSign, Info } from 'lucide-react-native';

interface IPOCardProps {
    item: IPOData;
    onPress: (item: IPOData) => void;
}

const IPOCardBase = ({ item, onPress }: IPOCardProps) => {
    const { colors } = useTheme();
    const [imageError, setImageError] = React.useState(false);

    // Animation refs
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();

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
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
        }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => onPress(item)}
                activeOpacity={0.9}
            >
                {/* ... rest of the card content ... */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { width: 44, height: 44 }]}>
                        <View style={[styles.logoplaceholder, { backgroundColor: colors.border, position: 'absolute', width: '100%', height: '100%' }]}>
                            <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>LOGO</Text>
                        </View>
                        {item.logoUrl && !imageError && (
                            <Image
                                source={{ uri: item.logoUrl }}
                                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                resizeMode="cover"
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
                                {item.status === 'Closed' && (
                                    <View style={[
                                        styles.allotmentBadge,
                                        { backgroundColor: item.isAllotmentOut ? '#E3F2FD' : '#FFF3E0', marginBottom: 4 }
                                    ]}>
                                        <Text style={[
                                            styles.allotmentText,
                                            { color: item.isAllotmentOut ? '#2196F3' : '#FF9800' }
                                        ]}>
                                            {item.isAllotmentOut ? 'ALLOTMENT OUT' : 'ALLOTMENT AWAITED'}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                        <Text style={[styles.gmpLabel, { color: colors.text, marginRight: 4 }]}>GMP</Text>
                                        <Info size={12} color={colors.text} opacity={0.5} />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                                        {(() => {
                                            const gmpStr = item.gmp || '';
                                            // Try to match "Amount (Percentage)"
                                            const match = gmpStr.match(/^(.+?)\s*(\(.*\))$/);
                                            if (match) {
                                                return (
                                                    <>
                                                        <Text style={[styles.gmpValue, { color: '#4CAF50', fontSize: 16, marginRight: 4 }]}>{match[1]}</Text>
                                                        <Text style={[styles.gmpValue, { color: '#4CAF50', fontSize: 16 }]}>{match[2]}</Text>
                                                    </>
                                                );
                                            }
                                            // Fallback if format is different
                                            return <Text style={[styles.gmpValue, { color: '#4CAF50', fontSize: 16 }]}>{gmpStr}</Text>;
                                        })()}
                                    </View>
                                </View>
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
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {item.maxPrice && (
                                    <Text style={{ fontSize: 16, fontWeight: '700' }}>
                                        ₹{Math.floor(item.maxPrice * parseInt(item.lotSize))}/
                                    </Text>
                                )}
                                {item.lotSize}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.disclaimerContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.disclaimerText, { color: colors.text }]}>
                        * GMP is based on market rumors and trends. It is for informational purposes only and does not guarantee the actual listing price.
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 0,
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
        alignItems: 'flex-start',
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
        fontWeight: '600',
        marginBottom: 4,
    },
    allotmentBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allotmentText: {
        fontSize: 9,
        fontWeight: '600',
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeBadge: {
        fontSize: 9,
        fontWeight: '500',
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
        fontWeight: '500',
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
        fontWeight: '500',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    gmpLabel: {
        fontSize: 10,
        opacity: 0.6,
        fontWeight: '600',
    },
    gmpValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimerContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderTopWidth: 0.5,
        opacity: 0.6,
    },
    disclaimerText: {
        fontSize: 8,
        fontStyle: 'italic',
        textAlign: 'center',
    }
});

export const IPOCard = React.memo(IPOCardBase);

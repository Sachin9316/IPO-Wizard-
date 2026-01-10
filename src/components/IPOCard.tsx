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
                    <View style={[styles.logoContainer, { width: 50, height: 45 }]}>
                        {(!item.logoUrl || imageError) && (
                            <View style={[styles.logoplaceholder, { backgroundColor: colors.border, position: 'absolute', width: '100%', height: '100%' }]}>
                                <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>LOGO</Text>
                            </View>
                        )}
                        {item.logoUrl && !imageError && (
                            <Image
                                source={{ uri: item.logoUrl }}
                                style={{ width: '100%', height: '100%' }}
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
                                                        <Text style={[styles.gmpValue, { color: '#4CAF50', marginRight: 4 }]}>{match[1]}</Text>
                                                        <Text style={[styles.gmpValue, { color: '#4CAF50' }]}>{match[2]}</Text>
                                                    </>
                                                );
                                            }
                                            // Fallback if format is different
                                            return <Text style={[styles.gmpValue, { color: '#4CAF50' }]}>{gmpStr}</Text>;
                                        })()}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View >

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.statsContainer}>
                    {/* Compact Row: Dates | Price | Lot | Subs */}
                    <View style={styles.statRow}>
                        <View style={[styles.statItem, { flex: 1.3 }]}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Offer Dates</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{item.dates.offerStart}-{item.dates.offerEnd}</Text>
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={[styles.statItem, { flex: 1.2 }]}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Price</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{item.priceRange}</Text>
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={[styles.statItem, { flex: 1.0 }]}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Lot Price</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {(() => {
                                    // Robust Price Calculation
                                    const clean = (str: string) => (str || '').replace(/,/g, '');
                                    const prices = clean(item.priceRange || '').match(/(\d+(\.\d+)?)/g)?.map(Number) || [];
                                    const maxPrice = prices.length > 0 ? Math.max(...prices) : (item.maxPrice || 0);

                                    // Robust Lot Size Parsing
                                    const lotSizeStr = String(item.lotSize || '');
                                    const lotSize = parseFloat(clean(lotSizeStr).match(/(\d+)/)?.[0] || '0');

                                    const lotVal = maxPrice * lotSize;

                                    if (lotVal > 0) {
                                        return (
                                            <Text style={{ textAlign: 'center' }}>
                                                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                                                    ₹{lotVal.toLocaleString('en-IN')}
                                                </Text>
                                            </Text>
                                        );
                                    }
                                    return item.lotSize;
                                })()}
                            </Text>
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={[styles.statItem, { flex: 0.8 }]}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>Subs</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{item.subscription || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.disclaimerContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.disclaimerText, { color: colors.text }]}>
                        * GMP is based on market rumors and trends. It is for informational purposes only and does not guarantee the actual listing price.
                    </Text>
                </View>
            </TouchableOpacity >
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
        alignItems: 'center',
    },
    logoContainer: {
        marginRight: 10,
    },
    logoplaceholder: {
        width: 50,
        height: 45,
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
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2,
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
        marginHorizontal: 16,
        opacity: 0.15,
    },
    statsContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    verticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E0E0E0',
        opacity: 0.15,
        marginHorizontal: 4,
    },
    statLabel: {
        fontSize: 11,
        opacity: 0.6,
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    gmpLabel: {
        fontSize: 11,
        opacity: 0.6,
        fontWeight: '600',
    },
    gmpValue: {
        fontSize: 14,
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

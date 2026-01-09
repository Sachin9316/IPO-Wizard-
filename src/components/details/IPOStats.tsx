import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Banknote, Calendar, IndianRupee, Layers, PieChart, TrendingUp, Users } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import moment from 'moment';

const GAP = 12;
const PADDING = 16;
// Scrollbar width on web can mess up exact calculations
const SCROLLBAR_WIDTH = Platform.OS === 'web' ? 18 : 0;

interface IPOStatsProps {
    item: IPOData;
}

const StatusBarItem = ({ label, value, valueColor, colors, icon, style, valueStyle, labelStyle }: any) => (
    <View style={[styles.statusBarItem, { backgroundColor: colors.card }, style]}>
        {icon}
        <View style={styles.statContent}>
            <Text style={[styles.statusLabel, { color: colors.text }, labelStyle]}>{label}</Text>
            <Text style={[styles.statusValue, { color: valueColor || colors.text }, valueStyle]} numberOfLines={1}>{value || '-'}</Text>
        </View>
    </View>
);

export const IPOStats = ({ item }: IPOStatsProps) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    const isTablet = width >= 768;
    const numColumns = isTablet ? 4 : 2;
    // Use floor to avoid sub-pixel rounding causing wrap. Subtracting 1 item gap effectively.
    const cardWidth = Math.floor((width - (PADDING * 2) - SCROLLBAR_WIDTH - (GAP * (numColumns - 1))) / numColumns);

    // Helper to inject calculation logic into styles
    const itemStyle = { width: cardWidth };

    return (
        <View style={styles.statsGrid}>
            <StatusBarItem
                icon={<Calendar size={16} color={colors.text} opacity={0.4} />}
                label="Offer Dates"
                value={`${moment(item.rawDates?.offerStart).format('DD MMM')} - ${moment(item.rawDates?.offerEnd).format('DD MMM')}`}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<IndianRupee size={16} color={colors.text} opacity={0.4} />}
                label="Price Range"
                value={item.priceRange}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<Layers size={16} color={colors.text} opacity={0.4} />}
                label="Lot Size"
                value={(
                    <Text>
                        {item.lotSize}{' '}
                        <Text style={{ fontSize: 10, opacity: 0.7 }}>/ lot</Text>
                    </Text>
                )}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<PieChart size={16} color={colors.text} opacity={0.4} />}
                label="Issue Size"
                value={item.issueSize}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<TrendingUp size={16} color={item.gmp?.includes('+') ? '#4CAF50' : colors.text} opacity={item.gmp?.includes('+') ? 1 : 0.4} />}
                label="GMP"
                value={item.gmp}
                valueColor={item.gmp?.includes('+') ? '#4CAF50' : undefined}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<Users size={16} color={colors.text} opacity={0.4} />}
                label="Subs."
                value={item.subscription}
                colors={colors}
                style={itemStyle}
            />
            <StatusBarItem
                icon={<Banknote size={20} color="#4CAF50" opacity={0.8} />}
                label="Est. Profit"
                valueColor="#4CAF50"
                style={{ ...itemStyle, width: isTablet ? cardWidth * 2 + GAP : cardWidth }}
                valueStyle={{ fontSize: 18, marginTop: 2 }}
                value={(() => {
                    const clean = (str: string) => (str || '').replace(/,/g, '');

                    // 1. Parse Lot Size
                    const lot = parseFloat(clean(item.lotSize || '').match(/(\d+(\.\d+)?)/)?.[0] || '0');
                    if (!lot) return '-';

                    // 2. Try User's Formula: GMP % of Max Lot Price
                    // Max Price from "100-120" -> 120
                    const prices = clean(item.priceRange || '').match(/(\d+(\.\d+)?)/g)?.map(Number) || [];
                    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                    // GMP Percentage from "₹ 50 (10%)" -> 10
                    const gmpPercentMatch = (item.gmp || '').match(/\(([\d.]+)%\)/) || (item.gmp || '').match(/([\d.]+)%/);
                    const gmpPercent = gmpPercentMatch ? parseFloat(gmpPercentMatch[1]) : null;

                    if (maxPrice && gmpPercent !== null) {
                        const profit = maxPrice * lot * (gmpPercent / 100);
                        return (
                            <Text>
                                {`₹ ${profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} `}
                                <Text style={{ fontSize: 12, opacity: 0.7 }}>/ lot</Text>
                            </Text>
                        );
                    }

                    // 3. Fallback: Absolute GMP * Lot Size
                    // "₹ 50 (10%)" -> extract "50" (first number)
                    const gmpAbsMatch = clean(item.gmp || '').match(/(\d+(\.\d+)?)/);
                    const gmpAbs = gmpAbsMatch ? parseFloat(gmpAbsMatch[0]) : null;

                    if (gmpAbs !== null) {
                        return (
                            <Text>
                                {`₹ ${(gmpAbs * lot).toLocaleString('en-IN', { maximumFractionDigits: 0 })} `}
                                <Text style={{ fontSize: 12, opacity: 0.7 }}>/ lot</Text>
                            </Text>
                        );
                    }

                    return '-';
                })()}
                colors={colors}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: PADDING,
        paddingBottom: 16,
        gap: GAP,
    },
    statusBarItem: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
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
});

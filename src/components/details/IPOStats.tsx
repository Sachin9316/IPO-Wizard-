
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import moment from 'moment';

const PADDING = 16;
// Scrollbar width on web can mess up exact calculations
const SCROLLBAR_WIDTH = Platform.OS === 'web' ? 18 : 0;

interface IPOStatsProps {
    item: IPOData;
}

const DetailStat = ({ label, value, colors, style, valueColor, isLast }: any) => (
    <View style={[styles.detailItem, style]}>
        <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: valueColor || colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value || '-'}</Text>
    </View>
);

export const IPOStats = ({ item }: IPOStatsProps) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.detailsGrid, { borderColor: colors.border }]}>
                {/* Row 1: GMP & Profit (High Priority) */}
                <View style={styles.detailRow}>
                    <DetailStat
                        label="LATEST GMP"
                        value={item.gmp}
                        valueColor={item.gmp?.includes('+') ? '#4CAF50' : undefined}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <DetailStat
                        label="EST. PROFIT"
                        value={(() => {
                            const clean = (str: string) => (str || '').replace(/,/g, '');
                            const lot = parseFloat(clean(item.lotSize || '').match(/(\d+(\.\d+)?)/)?.[0] || '0');
                            if (!lot) return '-';

                            const prices = clean(item.priceRange || '').match(/(\d+(\.\d+)?)/g)?.map(Number) || [];
                            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                            const gmpPercentMatch = (item.gmp || '').match(/\(([\d.]+)%\)/) || (item.gmp || '').match(/([\d.]+)%/);
                            const gmpPercent = gmpPercentMatch ? parseFloat(gmpPercentMatch[1]) : null;

                            if (maxPrice && gmpPercent !== null) {
                                const profit = maxPrice * lot * (gmpPercent / 100);
                                return '₹ ' + profit.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                            }
                            const gmpAbsMatch = clean(item.gmp || '').match(/(\d+(\.\d+)?)/);
                            const gmpAbs = gmpAbsMatch ? parseFloat(gmpAbsMatch[0]) : null;
                            if (gmpAbs !== null) return '₹ ' + (gmpAbs * lot).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                            return '-';
                        })()}
                        valueColor="#4CAF50"
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                </View>

                <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

                {/* Row 2: Price & Lot */}
                <View style={styles.detailRow}>
                    <DetailStat
                        label="PRICE BAND"
                        value={item.priceRange}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <DetailStat
                        label="LOT SIZE"
                        value={item.lotSize + ' Shares'}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                </View>

                <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

                {/* Row 3: Subscription & Issue Size */}
                <View style={styles.detailRow}>
                    <DetailStat
                        label="TOTAL SUBSCRIPTION"
                        value={item.subscription}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <DetailStat
                        label="ISSUE SIZE"
                        value={item.issueSize}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                </View>

                <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

                {/* Row 4: Dates */}
                <View style={styles.detailRow}>
                    <DetailStat
                        label="OFFER PERIOD"
                        value={moment(item.rawDates?.offerStart).format('DD MMM') + ' - ' + moment(item.rawDates?.offerEnd).format('DD MMM')}
                        colors={colors}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: PADDING,
        paddingBottom: 16,
    },
    detailsGrid: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    detailItem: {
        justifyContent: 'center',
        gap: 4,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        opacity: 0.5,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    separator: {
        width: 1,
        height: '100%',
        marginHorizontal: 16,
    },
    horizontalDivider: {
        height: 1,
        width: '100%',
    }
});

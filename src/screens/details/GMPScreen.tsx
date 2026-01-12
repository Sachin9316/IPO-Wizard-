import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { IPOHero } from '../../components/details/IPOHero';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GMPScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { ipo } = route.params;
    const gmpDetails = ipo?.gmpDetails;
    const name = ipo?.name;

    if (!gmpDetails || gmpDetails.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>GMP Trend</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContent}>
                    <Text style={{ color: colors.text }}>No GMP data available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Chart Data Preparation
    const prices = gmpDetails.map((d: any) => d.price);
    const maxPrice = Math.max(...prices, 0) * 1.2; // Add some headroom
    const minPrice = 0; // Baseline at 0 usually looks better for absolute values, or min(...prices) if negative

    const chartHeight = 220; // Increased height for labels
    const padding = 15; // Width padding (reduced to remove start gap)
    const verticalPadding = 30; // Separate vertical padding for labels
    const pointSpacing = 50; // Fixed spacing between points for scrollability

    const totalChartWidth = Math.max(SCREEN_WIDTH - 40, prices.length * pointSpacing + (padding * 2));

    const getX = (index: number) => {
        // Distribute points evenly across the scrollable width
        if (prices.length <= 1) return padding;
        const availableWidth = totalChartWidth - (padding * 2);
        return padding + (index * (availableWidth / (prices.length - 1)));
    };

    const getY = (price: number) => {
        return chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (chartHeight - (verticalPadding * 2)) - verticalPadding;
    };

    let pathD = `M ${getX(0)} ${getY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
        pathD += ` L ${getX(i)} ${getY(prices[i])}`;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>GMP Trend</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Hero Card */}
                <IPOHero item={ipo} style={{ paddingHorizontal: 0, paddingVertical: 0, marginBottom: 12 }} />

                {/* Profit Summary Card */}
                {(() => {
                    const latestGMP = gmpDetails.length > 0 ? gmpDetails[gmpDetails.length - 1].price : 0;
                    // Parse Lot Size
                    const lotSizeStr = ipo.lotSize ? ipo.lotSize.toString() : '0';
                    const lotSizeMatch = lotSizeStr.match(/(\d+(\.\d+)?)/);
                    const lotSize = lotSizeMatch ? parseFloat(lotSizeMatch[0]) : 0;

                    const estProfit = latestGMP * lotSize;

                    return (
                        <View style={[styles.profitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View>
                                <Text style={[styles.profitLabel, { color: colors.text }]}>Est. Listing Profit</Text>
                                <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>per lot ({lotSize} shares)</Text>
                            </View>
                            <Text style={[styles.profitValue, { color: estProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                                ₹{estProfit.toLocaleString('en-IN')}
                            </Text>
                        </View>
                    );
                })()}

                {/* Chart Section */}
                {prices.length > 1 && (
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>Price Movement</Text>
                            <TrendingUp size={16} color="#4CAF50" />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: gmpDetails.map((d: any) => d.date.split(' ')[0]), // Shorten date if needed
                                    datasets: [{ data: prices }]
                                }}
                                width={totalChartWidth}
                                height={220}
                                chartConfig={{
                                    backgroundColor: colors.card,
                                    backgroundGradientFrom: colors.card,
                                    backgroundGradientTo: colors.card,
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => colors.primary,
                                    labelColor: (opacity = 1) => colors.text + '80',
                                    style: { borderRadius: 16 },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: colors.primary
                                    },
                                    fillShadowGradient: colors.primary,
                                    fillShadowGradientOpacity: 0.2,
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                                withInnerLines={false}
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines={true}
                                segments={4}
                                formatYLabel={(yValue) => `₹${yValue}`}
                                onDataPointClick={({ value, getColor }) => {
                                    // Could add a tooltip here if needed
                                }}
                            />
                        </ScrollView>
                        <Text style={{ fontSize: 10, color: colors.text, opacity: 0.4, marginTop: 8 }}>
                            ← Scroll to view history →
                        </Text>
                    </View>
                )}

                {/* List Section */}
                <View style={styles.listContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Daily Updates</Text>
                        <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>
                            Last updated {gmpDetails.length > 0 ? (() => {
                                const dateStr = gmpDetails[gmpDetails.length - 1].date;
                                // Try to parse and format nicely
                                try {
                                    const date = new Date(dateStr.match(/\d{4}/) ? dateStr : `${dateStr} ${new Date().getFullYear()}`);
                                    return !isNaN(date.getTime())
                                        ? date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                        : dateStr;
                                } catch (e) { return dateStr; }
                            })() : '-'}
                        </Text>
                    </View>
                    {/* Header Row */}
                    <View style={[styles.row, styles.tableHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.col, styles.headerText, { color: colors.text, flex: 1.3 }]}>Date</Text>
                        <Text style={[styles.col, styles.headerText, { color: colors.text, flex: 0.9, textAlign: 'right' }]}>GMP (₹)</Text>
                        <Text style={[styles.col, styles.headerText, { color: colors.text, flex: 0.9, textAlign: 'right' }]}>Change</Text>
                        <Text style={[styles.col, styles.headerText, { color: colors.text, flex: 1.1, textAlign: 'right' }]}>GMP %</Text>
                    </View>

                    {[...gmpDetails].reverse().map((item: any, index: number) => {
                        const originalIndex = gmpDetails.length - 1 - index;
                        const previousItem = originalIndex > 0 ? gmpDetails[originalIndex - 1] : null;

                        let change = 0;
                        let changeIcon = null;

                        if (previousItem) {
                            change = item.price - previousItem.price;
                        }

                        if (change > 0) {
                            changeIcon = <TrendingUp size={12} color="#4CAF50" />;
                        } else if (change < 0) {
                            // TrendingDown icon not imported, rotate Up or use color
                            changeIcon = <TrendingUp size={12} color="#F44336" style={{ transform: [{ rotate: '180deg' }] }} />;
                        }

                        let issuePrice = ipo.max_price || ipo.maxPrice || ipo.min_price || ipo.minPrice || 0;

                        // Fallback: Extract from priceRange if not found
                        if (!issuePrice && ipo.priceRange) {
                            try {
                                const prices = ipo.priceRange.match(/(\d+(\.\d+)?)/g)?.map(Number) || [];
                                if (prices.length > 0) {
                                    issuePrice = Math.max(...prices);
                                }
                            } catch (e) {
                                // Ignore parsing error
                            }
                        }

                        // Use toFixed(2) and ensure string type for render
                        const gmpPercent = issuePrice > 0 ? ((item.price / issuePrice) * 100).toFixed(2) : '0.00';

                        // Format date to "12 Jan 2026"
                        const parseDate = (dateStr: string) => {
                            if (!dateStr) return new Date();
                            // Check if year is present (4 digits)
                            if (/\d{4}/.test(dateStr)) {
                                return new Date(dateStr);
                            }
                            // If not, append current year
                            const currentYear = new Date().getFullYear();
                            return new Date(`${dateStr} ${currentYear}`);
                        };

                        const dateObj = parseDate(item.date);
                        const formattedDate = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : item.date;

                        return (
                            <View key={index} style={[styles.row, { borderBottomColor: colors.border }]}>
                                <View style={[styles.dateCol, { flex: 1.3 }]}>
                                    <Text style={[styles.cellText, { color: colors.text, fontSize: 12 }]}>{formattedDate}</Text>
                                </View>

                                <Text style={[styles.col, styles.priceText, { color: item.price >= 0 ? '#4CAF50' : '#F44336', flex: 0.9, textAlign: 'right' }]}>
                                    ₹{item.price}
                                </Text>

                                <View style={[styles.col, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 0.9, gap: 4 }]}>
                                    {change !== 0 && changeIcon}
                                    <Text style={[styles.cellText, { color: change > 0 ? '#4CAF50' : (change < 0 ? '#F44336' : colors.text), fontWeight: '500', fontSize: 13 }]}>
                                        {change !== 0 ? `₹${Math.abs(change).toFixed(1).replace(/\.0$/, '')}` : '-'}
                                    </Text>
                                </View>

                                <Text style={[styles.col, styles.cellText, { color: colors.text, flex: 1.1, textAlign: 'right' }]}>
                                    {gmpPercent}%
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={[styles.disclaimerContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.disclaimerText, { color: colors.text }]}>
                        * GMP is based on market rumors and trends. It is for informational purposes only and does not guarantee the actual listing price.
                    </Text>
                </View>
            </ScrollView>
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
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    chartCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    listContainer: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    tableHeader: {
        borderBottomWidth: 2,
    },
    col: {
        flex: 1,
    },
    dateCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    cellText: {
        fontSize: 14,
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    disclaimerContainer: {
        marginTop: 24,
        paddingTop: 12,
        borderTopWidth: 0.5,
        opacity: 0.6,
    },
    disclaimerText: {
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    profitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    profitLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    profitValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

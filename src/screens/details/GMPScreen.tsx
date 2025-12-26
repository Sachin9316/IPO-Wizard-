import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { X, TrendingUp, Calendar } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GMPScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { gmpDetails, name } = route.params;

    if (!gmpDetails || gmpDetails.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X color={colors.text} size={24} />
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
                    <X color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>GMP Trend</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.companyName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>Grey Market Premium History</Text>
                </View>

                {/* Chart Section */}
                {prices.length > 1 && (
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.chartTitle, { color: colors.text }]}>Price Movement</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ paddingHorizontal: 10 }}>
                                <Svg width={totalChartWidth} height={chartHeight}>
                                    {/* Grid Lines */}
                                    <Line x1={padding} y1={verticalPadding} x2={padding} y2={chartHeight - verticalPadding} stroke={colors.border} strokeWidth="1" />
                                    <Line x1={padding} y1={chartHeight - verticalPadding} x2={totalChartWidth - padding} y2={chartHeight - verticalPadding} stroke={colors.border} strokeWidth="1" />

                                    {/* Trend Line */}
                                    <Path d={pathD} stroke={colors.primary} strokeWidth="3" fill="none" />

                                    {/* Data Points and Labels */}
                                    {gmpDetails.map((item: any, index: number) => {
                                        const x = getX(index);
                                        const y = getY(item.price);
                                        return (
                                            <React.Fragment key={index}>
                                                <Circle
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill={colors.background}
                                                    stroke={colors.primary}
                                                    strokeWidth="2"
                                                />
                                                {/* Price Label */}
                                                <SvgText
                                                    x={x}
                                                    y={y - 15}
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill={colors.text}
                                                    textAnchor="middle"
                                                >
                                                    ₹ {item.price}
                                                </SvgText>
                                                {/* Date Label */}
                                                <SvgText
                                                    x={x}
                                                    y={chartHeight - verticalPadding + 15}
                                                    fontSize="10"
                                                    fill={colors.text}
                                                    textAnchor="middle"
                                                    opacity={0.6}
                                                >
                                                    {item.date}
                                                </SvgText>
                                            </React.Fragment>
                                        );
                                    })}
                                </Svg>
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* List Section */}
                <View style={styles.listContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Updates</Text>
                    {/* Header Row */}
                    <View style={[styles.row, styles.tableHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.col, styles.headerText, { color: colors.text }]}>Date</Text>
                        <Text style={[styles.col, styles.headerText, { color: colors.text }]}>GMP (₹)</Text>
                        <Text style={[styles.col, styles.headerText, { color: colors.text }]}>Kostak</Text>
                    </View>

                    {[...gmpDetails].reverse().map((item: any, index: number) => (
                        <View key={index} style={[styles.row, { borderBottomColor: colors.border }]}>
                            <View style={styles.dateCol}>
                                <Calendar size={14} color={colors.text} style={{ opacity: 0.6, marginRight: 6 }} />
                                <Text style={[styles.cellText, { color: colors.text }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.col, styles.priceText, { color: item.price >= 0 ? '#4CAF50' : '#F44336' }]}>
                                ₹{item.price}
                            </Text>
                            <Text style={[styles.col, styles.cellText, { color: colors.text }]}>{item.kostak}</Text>
                        </View>
                    ))}
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
});

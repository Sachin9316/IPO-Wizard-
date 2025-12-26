import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Newspaper, TrendingUp, BarChart2, Zap } from 'lucide-react-native';
import { CustomHeader } from '../components/CustomHeader';

const INSIGHTS_DATA = [
    {
        id: '1',
        title: 'Tech IPOs to Watch in 2026: Trends and Predictions',
        summary: 'As interest rates stabilize, the tech sector is gearing up for a major IPO wave. Experts predict AI-driven companies will lead the charge...',
        tag: 'TRENDING',
        date: 'Oct 24, 2025',
        image: 'https://images.unsplash.com/photo-1518186239717-30e028470442?w=500&q=80',
        url: 'https://www.moneycontrol.com/news/business/ipo/'
    },
    {
        id: '2',
        title: 'Mastering IPO Investing: A Guide for Beginners',
        summary: 'How to evaluate an IPO? What is GMP? This comprehensive guide breaks down the essentials for every retail investor entering the market.',
        tag: 'GUIDE',
        date: 'Oct 23, 2025',
        image: 'https://images.unsplash.com/photo-1611974714024-4607a500bc71?w=500&q=80',
        url: 'https://www.chittorgarh.com/ipo/ipo_dashboard.asp'
    },
    {
        id: '3',
        title: 'The Impact of Allotment on GMP Trends',
        summary: 'Why does GMP drop after allotment? Understanding the demand-supply dynamics in the grey market post-shares distribution.',
        tag: 'EXPERT VIEW',
        date: 'Oct 22, 2025',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&q=80',
        url: 'https://www.investorgain.com/report/live-ipo-gmp/331/'
    }
];

export const InsightsScreen = () => {
    const { colors } = useTheme();

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL(item.url)}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={[styles.tagContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.tag}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardSummary, { color: colors.text }]} numberOfLines={2}>{item.summary}</Text>
                <View style={styles.cardFooter}>
                    <Text style={[styles.cardDate, { color: colors.text }]}>{item.date}</Text>
                    <Text style={[styles.readMore, { color: colors.primary }]}>Read More →</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <CustomHeader title="Financial Insights" />
            <FlatList
                data={INSIGHTS_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.heroRow}>
                            <View style={[styles.statBox, { backgroundColor: '#4CAF5020' }]}>
                                <TrendingUp size={20} color="#4CAF50" />
                                <Text style={[styles.statLabel, { color: colors.text }]}>Market Bullish</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: '#2196F320' }]}>
                                <BarChart2 size={20} color="#2196F3" />
                                <Text style={[styles.statLabel, { color: colors.text }]}>12 Active IPOs</Text>
                            </View>
                        </View>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    header: { marginBottom: 20 },
    heroRow: { flexDirection: 'row', gap: 12 },
    statBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', gap: 4 },
    statLabel: { fontSize: 12, fontWeight: '700' },
    card: { borderRadius: 16, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
    cardImage: { width: '100%', height: 160 },
    cardContent: { padding: 16 },
    tagContainer: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
    tagText: { fontSize: 10, fontWeight: 'bold' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    cardSummary: { fontSize: 14, lineHeight: 20, marginBottom: 16, opacity: 0.7 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardDate: { fontSize: 12, opacity: 0.5 },
    readMore: { fontSize: 14, fontWeight: 'bold' }
});

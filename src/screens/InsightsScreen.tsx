import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Newspaper, TrendingUp, BarChart2, TrendingDown, Globe } from 'lucide-react-native';
import { CustomHeader } from '../components/CustomHeader';
import { fetchNewsByCategory, NewsItem } from '../services/news.service';
import { useNavigation } from '@react-navigation/native';

const InsightCard = ({ title, category, icon: Icon, color, activeCategory, setActiveCategory, colors }: any) => {
    const isActive = activeCategory === category;
    return (
        <TouchableOpacity
            onPress={() => setActiveCategory(isActive ? 'All' : category)}
            style={[
                styles.statBox,
                {
                    backgroundColor: isActive ? color + '25' : colors.card,
                    borderColor: isActive ? color : colors.border,
                    borderWidth: isActive ? 1.5 : 1
                }
            ]}
        >
            <Icon size={20} color={isActive ? color : colors.text + '80'} />
            <Text style={[styles.statLabel, { color: isActive ? color : colors.text, fontWeight: isActive ? '800' : '600' }]}>{title}</Text>
        </TouchableOpacity>
    );
};

export const InsightsScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const loadNews = async (cat: string) => {
        setLoading(true);
        try {
            const data = await fetchNewsByCategory(cat === 'All' ? 'MARKET_NEWS' : cat.toUpperCase().replace(' ', '_'));
            setNews(data);
        } catch (e) {
            console.warn("Failed to load news", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews(activeCategory);
    }, [activeCategory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNews(activeCategory);
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: NewsItem }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('NewsViewer', { url: item.url, title: item.title })}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                defaultSource={require('../../assets/icon.png')} // Optional fallback
            />
            <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={[styles.tagContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={[styles.tagText, { color: colors.primary }]}>{item.source}</Text>
                    </View>
                    <Text style={[styles.cardDate, { color: colors.text }]}>{item.date}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.cardSummary, { color: colors.text }]} numberOfLines={2}>{item.summary}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="Financial Insights" />

            <FlatList
                data={news}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Market Snapshot</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroRow}>
                            <InsightCard title="Active IPOs" category="IPO" icon={BarChart2} color="#2196F3" activeCategory={activeCategory} setActiveCategory={setActiveCategory} colors={colors} />
                            <InsightCard title="Bullish" category="Bullish" icon={TrendingUp} color="#4CAF50" activeCategory={activeCategory} setActiveCategory={setActiveCategory} colors={colors} />
                            <InsightCard title="Bearish" category="Bearish" icon={TrendingDown} color="#F44336" activeCategory={activeCategory} setActiveCategory={setActiveCategory} colors={colors} />
                            <InsightCard title="Market News" category="Market News" icon={Globe} color="#9C27B0" activeCategory={activeCategory} setActiveCategory={setActiveCategory} colors={colors} />
                        </ScrollView>

                        <View style={styles.listHeaderRow}>
                            <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
                                {activeCategory === 'All' ? 'Trending Updates' : `${activeCategory} News`}
                            </Text>
                            {activeCategory !== 'All' && (
                                <TouchableOpacity onPress={() => setActiveCategory('All')}>
                                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>See All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ color: colors.text, marginTop: 12, opacity: 0.6 }}>Fetching live news...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Newspaper size={40} color={colors.text} style={{ opacity: 0.1, marginBottom: 16 }} />
                            <Text style={{ color: colors.text, opacity: 0.4 }}>No updates found in this category.</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    header: { marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, letterSpacing: 0.5 },
    heroRow: { flexDirection: 'row', paddingBottom: 4 },
    statBox: {
        width: 100,
        height: 85,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginRight: 10,
    },
    statLabel: { fontSize: 11, textAlign: 'center' },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 8
    },
    listHeaderTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, letterSpacing: 1 },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        overflow: 'hidden',
        height: 95
    },
    cardImage: { width: 95, height: 95 },
    cardContent: { flex: 1, padding: 10, justifyContent: 'center' },
    tagContainer: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tagText: { fontSize: 9, fontWeight: 'bold' },
    cardTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 2, lineHeight: 16 },
    cardSummary: { fontSize: 11, lineHeight: 15, opacity: 0.6 },
    cardDate: { fontSize: 9, opacity: 0.5 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 40 },
});

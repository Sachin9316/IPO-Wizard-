import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Search, X, ArrowLeft, TrendingUp } from 'lucide-react-native';
import { api } from '../services/api';
import { SkeletonIPOCard } from '../components/SkeletonIPOCard';

import { mapBackendToFrontend } from '../utils/mapper';
import { IPOData } from '../types/ipo';

export const SearchScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<IPOData[]>([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (text: string) => {
        setQuery(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (text.length < 2) {
            setResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Pass ipoType='ALL' to ensure backend understands we want everything (though search param should trigger it too)
                const response = await api.get('/mainboards', { params: { search: text, limit: 20, ipoType: 'ALL' } });
                const mapped = response.data.data.map(mapBackendToFrontend);
                setResults(mapped);
            } catch (error) {
                console.error("Search API Error:", error);
            } finally {
                setLoading(false);
            }
        }, 800);
    };

    const renderItem = ({ item }: { item: IPOData }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('IPODetails', { item })}
        >
            <View style={[styles.icon, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}>
                <Text style={{ fontSize: 8, opacity: 0.5 }}>LOGO</Text>
                {item.logoUrl && (
                    <Image
                        source={{ uri: item.logoUrl }}
                        style={[styles.icon, { position: 'absolute' }]}
                    />
                )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
                    <View style={[styles.badge, { backgroundColor: item.type === 'SME' ? '#F3E5F5' : '#E3F2FD' }]}>
                        <Text style={[styles.badgeText, { color: item.type === 'SME' ? '#7B1FA2' : '#1565C0' }]}>
                            {item.type}
                        </Text>
                    </View>
                </View>
            </View>
            {item.gmp && (
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.gmpLabel, { color: colors.text }]}>GMP</Text>
                    <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{item.gmp}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Search size={20} color={colors.text} style={{ opacity: 0.5 }} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Search IPOs..."
                        placeholderTextColor={colors.text + '80'}
                        value={query}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <X size={20} color={colors.text} style={{ opacity: 0.5 }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, padding: 16 }}>
                    <SkeletonIPOCard />
                    <SkeletonIPOCard />
                    <SkeletonIPOCard />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        query.length > 1 ? (
                            <View style={styles.center}>
                                <Text style={{ color: colors.text, opacity: 0.6 }}>No results found</Text>
                            </View>
                        ) : (
                            <View style={{ marginTop: 40, alignItems: 'center', opacity: 0.5 }}>
                                <TrendingUp size={48} color={colors.text} />
                                <Text style={{ color: colors.text, marginTop: 16 }}>Search for companies or symbols</Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 8,
        borderBottomWidth: 1, gap: 8
    },
    searchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, borderRadius: 8, height: 44
    },
    input: {
        flex: 1, marginLeft: 8, fontSize: 16, height: '100%'
    },
    center: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40
    },
    resultItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1,
    },
    icon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee'
    },
    name: {
        fontSize: 16, fontWeight: 'bold'
    },
    symbol: {
        fontSize: 12, opacity: 0.6, marginRight: 8
    },
    badge: {
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
    },
    badgeText: {
        fontSize: 10, fontWeight: 'bold'
    },
    gmpLabel: {
        fontSize: 10, opacity: 0.6
    }
});

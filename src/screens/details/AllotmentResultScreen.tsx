import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Easing, Share, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, User as UserIcon, Share2, Search, Trophy, MoreVertical } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

interface PANData {
    panNumber: string;
    name: string;
}

interface AllotmentResult {
    panNumber: string;
    name: string;
    status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED';
    units?: number;
}

export const AllotmentResultScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { ipo } = route.params;
    const ipoName = ipo?.name;
    const ipoLogo = ipo?.logoUrl;
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [results, setResults] = useState<AllotmentResult[]>([]);
    const [allPanCount, setAllPanCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkAllotment();
    }, []);

    const checkAllotment = async () => {
        setLoading(true);
        setProgress(0);

        try {
            // 1. Fetch Local PANs
            let localPans: PANData[] = [];
            const stored = await AsyncStorage.getItem('unsaved_pans');
            if (stored) {
                const parsed = JSON.parse(stored);
                localPans = parsed.map((p: any) => ({ panNumber: p.panNumber, name: p.name }));
            }

            // 2. Fetch Cloud PANs
            let cloudPans: PANData[] = [];
            if (isAuthenticated && user?.panDocuments) {
                cloudPans = user.panDocuments.map((p: any) => ({ panNumber: p.panNumber, name: p.name }));
            }

            // 3. Merge Unique PANs
            const allPansMap = new Map<string, PANData>();
            [...localPans, ...cloudPans].forEach(p => {
                allPansMap.set(p.panNumber, p);
            });
            const allPans = Array.from(allPansMap.values());
            setAllPanCount(allPans.length);

            if (allPans.length === 0) {
                setLoading(false);
                return;
            }

            // 4. Batch Process Logic (Simulating large dataset handling)
            const BATCH_SIZE = 50;
            const resultsBuffer: AllotmentResult[] = [];

            for (let i = 0; i < allPans.length; i += BATCH_SIZE) {
                const batch = allPans.slice(i, i + BATCH_SIZE);

                // Simulate Network Delay per batch
                await new Promise(resolve => setTimeout(resolve, 300));

                const batchResults = batch.map(pan => {
                    const status = getDeterministicStatus(pan.panNumber);
                    return {
                        panNumber: pan.panNumber,
                        name: pan.name,
                        status: status,
                        units: status === 'ALLOTTED' ? 1 : 0
                    };
                });

                resultsBuffer.push(...batchResults);
                setProgress(Math.min((i + BATCH_SIZE) / allPans.length, 1));
            }

            setResults(resultsBuffer);
            setLoading(false);

            // Trigger Fade In
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease)
            }).start();

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const getDeterministicStatus = (pan: string): 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED' => {
        // Simple hash: sum of char codes
        let sum = 0;
        for (let i = 0; i < pan.length; i++) {
            sum += pan.charCodeAt(i);
        }
        const outcome = sum % 3;
        if (outcome === 0) return 'ALLOTTED';
        if (outcome === 1) return 'NOT_ALLOTTED';
        return 'NOT_APPLIED';
    };

    const filteredResults = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.panNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [activeMenuPan, setActiveMenuPan] = useState<string | null>(null);

    const handleReportPress = (item: AllotmentResult) => {
        setActiveMenuPan(null);
        navigation.navigate('ReportIssue', {
            ipoName: ipoName,
            userName: item.name,
            panNumber: item.panNumber,
            allotmentStatus: item.status
        });
    };

    const handleShare = async (item: AllotmentResult) => {
        setActiveMenuPan(null);
        let message = '';
        if (item.status === 'ALLOTTED') {
            message = `🎉 Excited to share that I've been allotted shares in the ${ipoName} IPO! \n\nCheck your allotment status now on IPO Wizard app! 🚀`;
        } else if (item.status === 'NOT_ALLOTTED') {
            message = `Hard luck! No luck in ${ipoName} IPO allotment this time. \n\nBetter luck next time! Checking live status on IPO Wizard. 📊`;
        } else {
            message = `Checking ${ipoName} IPO allotment status on IPO Wizard app. \n\nStay updated with live GMP and subscriptions! 📈`;
        }

        try {
            await Share.share({
                message,
                title: 'IPO Allotment Status'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderResultCard = ({ item, index }: { item: AllotmentResult, index: number }) => {
        let statusColor, statusText;

        switch (item.status) {
            case 'ALLOTTED':
                statusColor = '#15803d'; // Green-700
                statusText = 'ALLOTTED';
                break;
            case 'NOT_ALLOTTED':
                statusColor = '#b91c1c'; // Red-700
                statusText = 'NOT ALLOTTED';
                break;
            case 'NOT_APPLIED':
            default:
                statusColor = '#475569'; // Slate-600
                statusText = 'NOT APPLIED';
                break;
        }

        // Dark mode adjustments
        if (colors.background !== '#FFFFFF') {
            if (item.status === 'ALLOTTED') {
                statusColor = '#4ade80'; // Green-400
            } else if (item.status === 'NOT_ALLOTTED') {
                statusColor = '#f87171'; // Red-400
            } else {
                statusColor = '#94a3b8'; // Slate-400
            }
        }

        const isMenuOpen = activeMenuPan === item.panNumber;

        return (
            <Animated.View style={{
                opacity: fadeAnim,
                marginBottom: 10,
                transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [10 * (index + 1), 0] }) }],
                zIndex: isMenuOpen ? 100 : 1 // Bring active card to front
            }}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }]}>
                    <View style={styles.cardContent}>
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={[styles.cardName, { color: colors.text, fontSize: 16 }]} numberOfLines={1}>{item.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <UserIcon size={12} color={colors.text} style={{ opacity: 0.5 }} />
                                <Text style={[styles.cardPan, { color: colors.text }]}>{item.panNumber}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10 }}>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.cardStatus, { color: statusColor, fontSize: 13, fontWeight: '700' }]}>{statusText}</Text>
                                {item.status === 'ALLOTTED' && (
                                    <Text style={{ fontSize: 11, color: statusColor, marginTop: 2, fontWeight: '500' }}>1 Lot / {item.units} Shares</Text>
                                )}
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => setActiveMenuPan(isMenuOpen ? null : item.panNumber)} style={{ padding: 4 }}>
                                    <MoreVertical size={20} color={colors.text} style={{ opacity: 0.5 }} />
                                </TouchableOpacity>

                                {isMenuOpen && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 30,
                                        right: 0,
                                        backgroundColor: colors.card,
                                        borderRadius: 12,
                                        padding: 4,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        minWidth: 180,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 8,
                                        elevation: 8,
                                        zIndex: 1000
                                    }}>
                                        <TouchableOpacity
                                            onPress={() => handleShare(item)}
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border + '33' }}
                                        >
                                            <Share2 size={16} color={colors.primary} />
                                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Share Result</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleReportPress(item)}
                                            style={{ padding: 12 }}
                                        >
                                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Report Status Issue</Text>
                                            <Text style={{ color: colors.text, fontSize: 9, opacity: 0.5, marginTop: 4 }}>
                                                Contact us if allotted but facing issues
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const allottedCount = results.filter(r => r.status === 'ALLOTTED').length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Allotment Status</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <View style={{ width: 200, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
                            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.primary }} />
                        </View>
                        <Text style={[styles.loadingText, { color: colors.text }]}>Checking {Math.floor(progress * allPanCount)} / {allPanCount}...</Text>
                    </View>
                ) : results.length > 0 ? (
                    <View style={{ flex: 1 }}>

                        {/* Simple Summary */}
                        {allottedCount > 0 && (
                            <View style={[styles.simpleBanner, { backgroundColor: colors.primary + '15', marginBottom: 16 }]}>
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🎉 {allottedCount} Applications Allotted!</Text>
                            </View>
                        )}

                        <View style={{ paddingHorizontal: 16, marginTop: allottedCount > 0 ? 0 : 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={[styles.ipoIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    {ipoLogo ? (
                                        <Image source={{ uri: ipoLogo }} style={styles.ipoIcon} resizeMode="contain" />
                                    ) : (
                                        <Trophy size={20} color={colors.primary} />
                                    )}
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.companyTitle, { color: colors.text, marginBottom: 0 }]}>{ipoName}</Text>
                                    <Text style={{ fontSize: 13, color: colors.text, opacity: 0.6 }}>
                                        {ipo?.symbol} • {ipo?.type}
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Search size={18} color={colors.text} style={{ opacity: 0.5, marginRight: 8 }} />
                                <TextInput
                                    style={{ flex: 1, color: colors.text, fontSize: 14, paddingVertical: 4 }}
                                    placeholder="Search by name or PAN..."
                                    placeholderTextColor={colors.text + '80'}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.statCount, { color: colors.primary }]}>{filteredResults.filter(r => r.status !== 'NOT_APPLIED').length}</Text>
                                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Applied</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.statCount, { color: '#15803d' }]}>{filteredResults.filter(r => r.status === 'ALLOTTED').length}</Text>
                                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Allotted</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.statCount, { color: '#b91c1c' }]}>{filteredResults.filter(r => r.status === 'NOT_ALLOTTED').length}</Text>
                                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Not Allotted</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.statCount, { color: colors.text, opacity: 0.6 }]}>{filteredResults.filter(r => r.status === 'NOT_APPLIED').length}</Text>
                                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Not Applied</Text>
                            </View>
                        </View>

                        <FlatList
                            data={filteredResults}
                            keyExtractor={item => item.panNumber}
                            renderItem={renderResultCard}
                            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 32, color: colors.text, opacity: 0.6 }}>No results.</Text>
                            }
                        />

                    </View>
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={{ color: colors.text }}>No PANs found.</Text>
                        <TouchableOpacity style={{ marginTop: 10 }} onPress={() => navigation.navigate("Root", { screen: "PANs" })}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Add PANs</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 12, borderBottomWidth: 1,
    },
    closeBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    content: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },

    simpleBanner: {
        padding: 8, alignItems: 'center', justifyContent: 'center'
    },
    companyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1,
    },

    // Simple Card Styles
    card: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 8,
        padding: 12,
        // Remove elevation for simpler look, or keep minimal
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    cardName: { fontSize: 14, fontWeight: 'bold' },
    cardPan: { fontSize: 12, opacity: 0.6 },
    cardStatus: { fontSize: 12, fontWeight: 'bold' },
    shareBtn: {
        position: 'absolute', top: 8, right: 8, opacity: 0.5
    },

    statsContainer: {
        flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    },
    statBox: {
        flex: 1, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1,
    },
    statCount: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    statLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
    ipoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    ipoIcon: {
        width: '100%',
        height: '100%'
    }
});

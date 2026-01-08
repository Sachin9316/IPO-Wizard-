import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Easing, Share, Image, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, User as UserIcon, Share2, Search, Trophy, MoreVertical, RefreshCw, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { checkAllotmentStatus, fetchMainboardIPOById } from '../../services/api';
import { AllotmentStats } from '../../components/allotment/AllotmentStats';
import { AllotmentResultCard } from '../../components/allotment/AllotmentResultCard';

interface PANData {
    panNumber: string;
    name: string;
}

interface AllotmentResult {
    panNumber: string;
    name: string;
    status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED' | 'ERROR' | 'UNKNOWN' | 'CHECKING' | 'WAITING';
    units?: number;
    message?: string;
    dpId?: string;
}

export const AllotmentResultScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { ipo: initialIpo } = route.params;
    const [ipo, setIpo] = useState(initialIpo);
    const ipoName = ipo?.name || ipo?.companyName;
    const ipoLogo = ipo?.logoUrl || ipo?.icon;
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [results, setResults] = useState<AllotmentResult[]>([]);
    const [allPanCount, setAllPanCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshingPans, setRefreshingPans] = useState<Set<string>>(new Set());
    const [hasError, setHasError] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fetch fresh IPO data to get latest Registrar info
        const syncIpoData = async () => {
            if (initialIpo?._id) {
                try {
                    const fresh = await fetchMainboardIPOById(initialIpo._id);
                    if (fresh) {
                        console.log('Refreshed IPO:', fresh.companyName, fresh.registrarName);
                        setIpo(prev => ({ ...prev, ...fresh }));
                    }
                } catch (e) {
                    console.log('Failed to sync IPO data', e);
                }
            }
        };
        syncIpoData();
    }, []);

    useEffect(() => {
        // Wait for IPO sync if possible, or just run if we trust initial
        // But better to run checkAllotment AFTER sync?
        // Typically sync is fast. Let's run checkAllotment but it uses `ipo` state.
        // If we run it immediately, it might use stale `ipo`.
        // So we should depend on `ipo`? NO, infinite loop.
        // We will call checkAllotment inside a separate effect or just run, but checkAllotment reads `ipo` state closure?
        // No, checkAllotment is defined inside render, so it reads current `ipo` state ref.
        checkAllotment();
    }, [ipo.registrarName]); // Re-run if registrarName updates!

    const getRegistrarKey = (name?: string) => {
        if (!name) return null;
        const n = name.toUpperCase();
        if (n.includes('LINK') || n.includes('MUFG')) return 'LINK_INTIME';
        if (n.includes('BIGSHARE')) return 'BIGSHARE';
        if (n.includes('KFIN')) return 'KFINTECH';
        if (n.includes('MAASHITLA')) return 'MAASHITLA';
        if (n.includes('SKYLINE')) return 'SKYLINE';
        if (n.includes('CAMEO')) return 'CAMEO';
        if (n.includes('PURVA')) return 'PURVA';
        return null;
    };

    const handleOpenRegistrar = () => {
        if (ipo.registrarLink) {
            const { Linking } = require('react-native');
            Linking.openURL(ipo.registrarLink);
        }
    };

    const checkAllotment = async () => {
        setLoading(true);
        setProgress(0);

        try {
            // Use registrarName map, fallback to registrarLink
            const rawRegistrarName = ipo.registrarName || ipo.registrar || ipo.registrarLink;
            console.log("DEBUG: ipo string state:", JSON.stringify(ipo));
            console.log("DEBUG: checkAllotment running with registrarName:", rawRegistrarName);

            const registrarKey = getRegistrarKey(rawRegistrarName);
            console.log("DEBUG: Derived Registrar Key:", registrarKey);

            // Removed early exit for missing registrarKey to allow showing PANs


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

            // 4. Call Backend API Sequentially
            // We iterate one by one to give user progress feedback

            if (!registrarKey) {
                const mappedResults: AllotmentResult[] = allPans.map(p => ({
                    panNumber: p.panNumber,
                    name: p.name,
                    status: 'UNKNOWN' as const,
                    units: 0,
                    message: 'Registrar not supported'
                }));
                setResults(mappedResults);
                setLoading(false);
                Animated.timing(fadeAnim, {
                    toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease)
                }).start();
                return;
            }

            // Initialize results with a "PENDING" or "WAITING" state if you want, 
            // or just built it up. Let's fill with initial "waiting" state.
            const initialResults: AllotmentResult[] = allPans.map(p => ({
                panNumber: p.panNumber,
                name: p.name,
                status: 'WAITING', // Show as gray/loading
                units: 0,
                message: 'Waiting...'
            }));
            setResults(initialResults);
            setLoading(false); // <--- SHOW LIST IMMEDIATELY

            // Trigger Fade In immediately so user sees the list
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease)
            }).start();

            let completedCount = 0;

            for (let i = 0; i < allPans.length; i++) {
                const p = allPans[i];

                // Update progress "Checking..." for this item? 
                // We'll rely on the specific card showing 'Waiting...' or we could add a 'loading' indicator to the card.

                // Set current item to CHECKING
                setResults(prev => prev.map(item =>
                    item.panNumber === p.panNumber ? { ...item, status: 'CHECKING', message: 'Checking...' } : item
                ));

                try {
                    const response = await checkAllotmentStatus(ipoName, registrarKey, [p.panNumber]);

                    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                        const res = response.data[0];
                        // Update this specific result in state
                        setResults(prev => prev.map(item => {
                            if (item.panNumber === p.panNumber) {
                                const originalPan = allPans.find(pan => pan.panNumber === p.panNumber);

                                let finalStatus = res.status;
                                let finalMessage = res.message || '';

                                // Sanitize Technical/Backend Errors
                                const isTechnicalError =
                                    finalMessage.includes('browserType.launch') ||
                                    finalMessage.includes('Executable doesn') ||
                                    finalMessage.includes('playwright') ||
                                    finalMessage.includes('/root/.cache/') || // Path usually indicates server error
                                    finalMessage.includes('Target closed') ||
                                    finalMessage.includes('Worker Request Failed');

                                if (isTechnicalError) {
                                    console.warn(`Sanitized technical error for PAN ${p.panNumber}: ${finalMessage}`);
                                    finalStatus = 'NOT_APPLIED';
                                    finalMessage = 'No record found';
                                }

                                return {
                                    ...item,
                                    status: finalStatus,
                                    units: res.units || 0,
                                    message: finalMessage,
                                    // Prefer name from API (cleaned), fallback to local cache, fallback to current
                                    name: res.name || (originalPan ? originalPan.name : item.name),
                                    dpId: res.dpId
                                };
                            }
                            return item;
                        }));
                    } else {
                        // Update as Not Found or Error
                        setResults(prev => prev.map(item => {
                            if (item.panNumber === p.panNumber) {
                                return { ...item, status: 'NOT_APPLIED', message: 'No record found' };
                            }
                            return item;
                        }));
                    }
                } catch (err) {
                    console.error(`Error checking PAN ${p.panNumber}`, err);
                    setResults(prev => prev.map(item => {
                        if (item.panNumber === p.panNumber) {
                            return { ...item, status: 'NOT_APPLIED', message: 'No record found' };
                        }
                        return item;
                    }));
                }

                completedCount++;
                setProgress(completedCount / allPans.length);

                // Small delay to prevent UI freeze and rate limiting
                if (i < allPans.length - 1) {
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            setLoading(false);
            setHasError(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
            setHasError(true);
        }
    };

    const filteredResults = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.panNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [activeMenuPan, setActiveMenuPan] = useState<string | null>(null);



    const handleRefreshPan = async (item: AllotmentResult) => {
        console.log("Handle Refresh Pan Triggered for:", item.panNumber);
        if (refreshingPans.has(item.panNumber)) {
            console.log("Already refreshing:", item.panNumber);
            return;
        }

        const registrarKey = getRegistrarKey(ipo.registrarName || ipo.registrar || ipo.registrarLink);
        console.log("Registrar Key for Single Check:", registrarKey);

        if (!registrarKey) {
            Alert.alert(
                "Unsupported Registrar",
                `Automatic checking is not supported for ${ipo.registrarName || 'this registrar'}. Please check manually on their website.`
            );
            return;
        }

        setRefreshingPans(prev => new Set(prev).add(item.panNumber));
        try {
            console.log("Calling API for single PAN with FORCE refresh...");
            // Pass forceRefresh = true
            const response = await checkAllotmentStatus(ipoName, registrarKey, [item.panNumber], true);
            console.log("Single Refresh Response:", response);

            if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                const res = response.data[0];
                setResults(prevResults => prevResults.map(r => {
                    if (r.panNumber === item.panNumber) {
                        let finalStatus = res.status;
                        let finalMessage = res.message || '';

                        // Sanitize Technical/Backend Errors
                        const isTechnicalError =
                            finalMessage.includes('browserType.launch') ||
                            finalMessage.includes('Executable doesn') ||
                            finalMessage.includes('playwright') ||
                            finalMessage.includes('/root/.cache/') ||
                            finalMessage.includes('Target closed') ||
                            finalMessage.includes('Worker Request Failed');

                        if (isTechnicalError) {
                            console.warn(`Sanitized technical error for PAN ${item.panNumber}: ${finalMessage}`);
                            finalStatus = 'NOT_APPLIED';
                            finalMessage = 'No record found';
                        }

                        return {
                            ...r,
                            status: finalStatus,
                            units: res.units || 0,
                            message: finalMessage,
                            name: res.name || r.name, // Update name if cleaned version returned
                            dpId: res.dpId
                        };
                    }
                    return r;
                }));
            } else {
                console.log("Single refresh returned no valid data (Status remains same/Not Found)");
                // User requested no dialog, just silent update/completion.
                // We could explicitly set to NOT_APPLIED if we wanted to enforce it, 
                // but if it was already NOT_APPLIED, doing nothing is fine.
                // The loader will stop in finally block.
            }
        } catch (error) {
            console.error("Single PAN Refresh Error:", error);
            Alert.alert("Error", "Failed to refresh status. Please try again.");
        } finally {
            setRefreshingPans(prev => {
                const next = new Set(prev);
                next.delete(item.panNumber);
                return next;
            });
        }
    };

    const onRefresh = React.useCallback(async () => {
        await checkAllotment();
    }, [ipo.registrarName]);

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
        return (
            <AllotmentResultCard
                item={item}
                index={index}
                fadeAnim={fadeAnim}
                isMenuOpen={activeMenuPan === item.panNumber}
                refreshing={refreshingPans.has(item.panNumber)}
                onRefresh={handleRefreshPan}
                onMenuToggle={() => setActiveMenuPan(activeMenuPan === item.panNumber ? null : item.panNumber)}
                onShare={handleShare}
                onReport={handleReportPress}
            />
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




                        <AllotmentStats results={filteredResults} />


                        <FlatList
                            data={filteredResults}
                            keyExtractor={item => item.panNumber}
                            renderItem={renderResultCard}
                            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}
                            onScrollBeginDrag={() => {
                                if (activeMenuPan) setActiveMenuPan(null);
                            }}
                            refreshControl={
                                <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[colors.primary]} />
                            }
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 32, color: colors.text, opacity: 0.6 }}>No results.</Text>
                            }
                        />

                    </View>
                ) : hasError ? (
                    <View style={styles.centerContainer}>
                        <XCircle size={48} color={colors.notification} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Unable to check status</Text>
                        <Text style={{ color: colors.text, opacity: 0.6, marginTop: 4, textAlign: 'center', paddingHorizontal: 32 }}>
                            We couldn't connect to the server or the registrar is unavailable.
                        </Text>
                        <TouchableOpacity
                            style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                            onPress={checkAllotment}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Retry</Text>
                        </TouchableOpacity>
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

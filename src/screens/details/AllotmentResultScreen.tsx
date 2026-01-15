import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Easing, Share, RefreshControl, Alert, InteractionManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { XCircle, RotateCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { checkAllotmentStatus, fetchMainboardIPOById, addUserPAN } from '../../services/api';
import { AllotmentStats } from '../../components/allotment/AllotmentStats';
import { AllotmentResultCard } from '../../components/allotment/AllotmentResultCard';
import { AddPANBottomSheet } from '../../components/AddPANBottomSheet';
import { AllotmentSkeleton } from '../../components/AllotmentSkeleton';
import { AllotmentHeader } from '../../components/allotment/AllotmentHeader';
import { AllotmentFilterHeader } from '../../components/allotment/AllotmentFilterHeader';
import { debounce } from 'lodash';

interface PANData {
    panNumber: string;
    name: string;
    source: 'LOCAL' | 'CLOUD';
}

interface AllotmentResult {
    panNumber: string;
    name: string;
    status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED' | 'ERROR' | 'UNKNOWN' | 'CHECKING' | 'WAITING';
    units?: number;
    message?: string;
    dpId?: string;
    source: 'LOCAL' | 'CLOUD';
}

export const AllotmentResultScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { ipo: initialIpo } = route.params;
    const [ipo, setIpo] = useState(initialIpo);
    const ipoName = ipo?.name || ipo?.companyName;
    const { user, isAuthenticated, token, refreshProfile } = useAuth();

    const [isTransitioning, setIsTransitioning] = useState(true);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<AllotmentResult[]>([]);
    const [allPanCount, setAllPanCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshingPans, setRefreshingPans] = useState<Set<string>>(new Set());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasError, setHasError] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;

    const isCheckingAny = results.some(r => r.status === 'CHECKING' || r.status === 'WAITING');
    const shouldSpin = loading || isRefreshing || isCheckingAny;

    useEffect(() => {
        if (shouldSpin) {
            spinValue.setValue(0);
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.stopAnimation();
            spinValue.setValue(0);
        }
    }, [shouldSpin]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    useEffect(() => {
        const runTask = async () => {
            setIsTransitioning(false);
            const syncIpoData = async () => {
                if (initialIpo?._id) {
                    try {
                        const fresh = await fetchMainboardIPOById(initialIpo._id);
                        if (fresh) {
                            setIpo((prev: any) => ({ ...prev, ...fresh }));
                        }
                    } catch (e) {
                        console.log('Failed to sync IPO data', e);
                    }
                }
            };
            await syncIpoData();
        };

        if (Platform.OS === 'web') {
            runTask();
            return () => { };
        } else {
            const task = InteractionManager.runAfterInteractions(runTask);
            return () => task.cancel();
        }
    }, [initialIpo?._id]);

    useEffect(() => {
        if (!isTransitioning) {
            checkAllotment();
        }
    }, [isTransitioning, ipo.registrarName]);

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

    const checkAllotment = async (forceRefresh = false, skipApiCheck = false) => {
        if (forceRefresh) setIsRefreshing(true);
        const CACHE_KEY = `ALLOTMENT_CACHE_${ipoName}`;

        // 1. Load PANs (Moved to top to validate cache)
        let localPans: PANData[] = [];
        const stored = await AsyncStorage.getItem('unsaved_pans');
        if (stored) {
            const parsed = JSON.parse(stored);
            localPans = parsed.map((p: any) => ({ panNumber: p.panNumber, name: p.name, source: 'LOCAL' as const }));
        }

        let cloudPans: PANData[] = [];
        if (isAuthenticated && user?.panDocuments) {
            cloudPans = user.panDocuments.map((p: any) => ({ panNumber: p.panNumber, name: p.name, source: 'CLOUD' as const }));
        }

        const allPansMap = new Map<string, PANData>();
        [...localPans, ...cloudPans].forEach(p => {
            if (allPansMap.has(p.panNumber)) {
                if (p.source === 'CLOUD') allPansMap.set(p.panNumber, p);
            } else {
                allPansMap.set(p.panNumber, p);
            }
        });
        const allPans = Array.from(allPansMap.values());
        setAllPanCount(allPans.length);

        if (allPans.length === 0) {
            setLoading(false);
            setIsRefreshing(false);
            setResults([]); // Ensure results are cleared if no PANs
            return;
        }

        // 2. Try Cache First (Validate against current PANs)
        if (!forceRefresh && !skipApiCheck) {
            try {
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const parsedResults: AllotmentResult[] = JSON.parse(cachedData);

                    // Critical Fix: Filter cache to only include current PANs
                    const validCache = parsedResults.filter(r => allPansMap.has(r.panNumber));

                    // Also update names/sources from current PANs to ensure freshness
                    const refreshedCache = validCache.map(r => {
                        const current = allPansMap.get(r.panNumber);
                        return { ...r, name: current?.name || r.name, source: current?.source || r.source };
                    });

                    // Only return early if we have a result for EVERY current PAN
                    if (refreshedCache.length === allPans.length) {
                        setResults(refreshedCache);
                        setLoading(false);
                        Animated.timing(fadeAnim, {
                            toValue: 1, duration: 300, useNativeDriver: false, easing: Easing.out(Easing.ease)
                        }).start();
                        return;
                    }
                }
            } catch (e) { console.log("Failed to load cache", e); }
        }

        if (results.length === 0) setLoading(true);

        try {
            const rawRegistrarName = ipo.registrarName || ipo.registrar || ipo.registrarLink;
            const registrarKey = getRegistrarKey(rawRegistrarName);

            // 3. Prepare Initial Results
            let cachedResults: AllotmentResult[] = [];
            try {
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) cachedResults = JSON.parse(cachedData);
            } catch (e) { }

            const mergedResults: AllotmentResult[] = allPans.map(p => {
                const existing = cachedResults.find(r => r.panNumber === p.panNumber) || results.find(r => r.panNumber === p.panNumber);
                if (existing) {
                    return { ...existing, name: p.name, source: p.source, status: existing.status === 'CHECKING' ? 'WAITING' : existing.status };
                }
                return {
                    panNumber: p.panNumber, name: p.name, status: 'WAITING', units: 0, message: 'Tap to check', source: p.source
                };
            });

            setResults(mergedResults);
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 500, useNativeDriver: false, easing: Easing.out(Easing.ease)
            }).start();

            // 4. API Check Loop (Skip if requested)
            if (skipApiCheck) {
                AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mergedResults));
                setIsRefreshing(false);
                return;
            }

            // Only set WAITING for items that need checking
            const initialLoopResults = mergedResults.map(r => {
                const isCached = ['ALLOTTED', 'NOT_ALLOTTED', 'NOT_APPLIED'].includes(r.status);
                if (isCached && !forceRefresh) return r;
                return { ...r, status: 'WAITING' as const, message: 'Waiting...' };
            });
            setResults(initialLoopResults);

            let completedCount = 0;
            let currentResultsState = [...initialLoopResults];

            for (let i = 0; i < allPans.length; i++) {
                const p = allPans[i];

                const previousState = mergedResults.find(r => r.panNumber === p.panNumber);
                const isCached = previousState && ['ALLOTTED', 'NOT_ALLOTTED', 'NOT_APPLIED'].includes(previousState.status);

                if (!isCached || forceRefresh) {
                    setResults(prev => prev.map(item => item.panNumber === p.panNumber ? { ...item, status: 'CHECKING', message: 'Checking...' } : item));
                }

                try {
                    const registrarToSend = registrarKey || rawRegistrarName;

                    let pollAttempts = 0;
                    const MAX_RETRIES = 15;
                    const POLL_INTERVAL = 2000;

                    const pollStatus = async (): Promise<any> => {
                        const response = await checkAllotmentStatus(ipoName, registrarToSend, [p.panNumber], forceRefresh);

                        if (response.success && response.data.length > 0) {
                            const res = response.data[0];
                            if (res.status === 'CHECKING' && pollAttempts < MAX_RETRIES) {
                                pollAttempts++;
                                await new Promise(r => setTimeout(r, POLL_INTERVAL));
                                return pollStatus();
                            }
                            return response;
                        }
                        return response;
                    };

                    const response = await pollStatus();

                    const updateFunction = (item: AllotmentResult) => {
                        if (item.panNumber === p.panNumber) {
                            if (response.success && response.data.length > 0) {
                                const res = response.data[0];
                                let finalStatus = res.status;
                                let finalMessage = res.message || '';
                                if (finalMessage.includes('browserType.launch') || finalMessage.includes('playwright')) {
                                    finalStatus = 'NOT_APPLIED'; finalMessage = 'No record found';
                                }
                                return { ...item, status: finalStatus, units: res.units || 0, message: finalMessage, name: item.name, dpId: res.dpId };
                            } else {
                                return { ...item, status: 'NOT_APPLIED', message: 'No record found' };
                            }
                        }
                        return item;
                    };
                    setResults(prev => prev.map(updateFunction));
                    currentResultsState = currentResultsState.map(updateFunction);
                } catch (err) {
                    setResults(prev => prev.map(item => item.panNumber === p.panNumber ? { ...item, status: 'NOT_APPLIED', message: 'No record found' } : item));
                    currentResultsState = currentResultsState.map(item => item.panNumber === p.panNumber ? { ...item, status: 'NOT_APPLIED', message: 'No record found' } : item as any);
                }

                completedCount++;
                setProgress(completedCount / allPans.length);
                if (i < allPans.length - 1) await new Promise(r => setTimeout(r, 100));
            }
            setHasError(false);
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(currentResultsState));
        } catch (error) {
            console.error(error);
            setLoading(false);
            setHasError(true);
        } finally {
            setIsRefreshing(false);
        }
    };

    const [filterSource, setFilterSource] = useState<'ALL' | 'CLOUD' | 'LOCAL'>('ALL');
    const filteredResults = results.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.panNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource = filterSource === 'ALL' ? true : item.source === filterSource;
        return matchesSearch && matchesSource;
    }).sort((a, b) => {
        const priority: { [key: string]: number } = {
            'ALLOTTED': 1,
            'NOT_ALLOTTED': 2,
            'NOT_APPLIED': 3
        };
        const p1 = priority[a.status] || 4;
        const p2 = priority[b.status] || 4;
        return p1 - p2;
    });

    const [activeMenuPan, setActiveMenuPan] = useState<string | null>(null);

    const handleRefreshPan = async (item: AllotmentResult) => {
        if (refreshingPans.has(item.panNumber)) return;
        const rawRegistrarName = ipo.registrarName || ipo.registrar || ipo.registrarLink;
        const registrarKey = getRegistrarKey(rawRegistrarName);

        setRefreshingPans(prev => new Set(prev).add(item.panNumber));
        try {
            const registrarToSend = registrarKey || rawRegistrarName;

            let pollAttempts = 0;
            const MAX_RETRIES = 15;
            const POLL_INTERVAL = 2000;

            const pollStatus = async (): Promise<any> => {
                const response = await checkAllotmentStatus(ipoName, registrarToSend, [item.panNumber], true);
                if (response.success && response.data.length > 0) {
                    const res = response.data[0];
                    if (res.status === 'CHECKING' && pollAttempts < MAX_RETRIES) {
                        pollAttempts++;
                        await new Promise(r => setTimeout(r, POLL_INTERVAL));
                        return pollStatus();
                    }
                    return response;
                }
                return response;
            };

            const response = await pollStatus();

            if (response.success && response.data.length > 0) {
                const res = response.data[0];
                setResults(prev => prev.map(r => r.panNumber === item.panNumber ? { ...r, status: res.status, units: res.units, message: res.message, name: r.name } : r));
            }
        } catch (error) { Alert.alert("Error", "Failed to refresh status."); }
        finally { setRefreshingPans(prev => { const next = new Set(prev); next.delete(item.panNumber); return next; }); }
    };

    const onRefresh = () => {
        checkAllotment(true, false);
    };

    const handleReportPress = (item: AllotmentResult) => {
        setActiveMenuPan(null);
        navigation.navigate('ReportIssue', { ipoName: ipoName, userName: item.name, panNumber: item.panNumber, allotmentStatus: item.status });
    };

    const handleShare = async (item: AllotmentResult) => {
        setActiveMenuPan(null);
        let message = '';
        if (item.status === 'ALLOTTED') message = `🎉 Allotted in ${ipoName}! Check IPO Wizard!`;
        else if (item.status === 'NOT_ALLOTTED') message = `No luck in ${ipoName}. Better luck next time!`;
        else message = `Checking ${ipoName} status on IPO Wizard.`;
        try { await Share.share({ message, title: 'IPO Allotment Status' }); } catch (error) { console.error(error); }
    };

    const [modalVisible, setModalVisible] = useState(false);
    const { showToast } = useUI();

    const handleAddPan = async (data: { panNumber: string, name?: string }) => {
        try {
            if (results.some(r => r.panNumber === data.panNumber)) { Alert.alert("Duplicate", "PAN already exists."); return; }

            let newResult: AllotmentResult = { panNumber: data.panNumber, name: data.name || data.panNumber, status: 'WAITING', message: 'Tap to check', source: isAuthenticated ? 'CLOUD' : 'LOCAL' };

            if (isAuthenticated && user && token) {
                await addUserPAN(token, { panNumber: data.panNumber, name: data.name || data.panNumber });
                await refreshProfile();
                showToast({ message: "PAN saved to account", type: "success" });
            } else {
                const stored = await AsyncStorage.getItem('unsaved_pans');
                const currentPans = stored ? JSON.parse(stored) : [];
                if (!currentPans.some((p: any) => p.panNumber === data.panNumber)) {
                    await AsyncStorage.setItem('unsaved_pans', JSON.stringify([...currentPans, { id: Date.now().toString(), panNumber: data.panNumber, name: data.name || data.panNumber }]));
                    showToast({ message: "PAN saved locally", type: "success" });
                }
            }

            let updatedList = [newResult, ...results];
            setResults(updatedList);
            setAllPanCount(prev => prev + 1);

            setTimeout(() => {
                const itemToCheck = { ...newResult, status: 'CHECKING' as const, message: 'Checking...' };
                setResults(prev => prev.map(r => r.panNumber === data.panNumber ? itemToCheck : r));
                handleRefreshPan(itemToCheck);
            }, 500);

        } catch (error) { Alert.alert("Error", "Failed to save PAN."); }
    };

    const renderResultCard = ({ item, index }: { item: AllotmentResult, index: number }) => (
        <AllotmentResultCard
            item={item} index={index} fadeAnim={fadeAnim} isMenuOpen={activeMenuPan === item.panNumber}
            refreshing={refreshingPans.has(item.panNumber)} onRefresh={handleRefreshPan}
            onMenuToggle={() => setActiveMenuPan(activeMenuPan === item.panNumber ? null : item.panNumber)}
            onShare={handleShare} onReport={handleReportPress}
        />
    );

    const allottedCount = results.filter(r => r.status === 'ALLOTTED').length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <AllotmentHeader onAddPress={() => setModalVisible(true)} />

            <View style={styles.content}>
                {loading && results.length === 0 ? (
                    <AllotmentSkeleton />
                ) : results.length > 0 ? (
                    <View style={{ flex: 1 }}>
                        <AllotmentFilterHeader
                            ipo={ipo} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            filterSource={filterSource} setFilterSource={setFilterSource} allottedCount={allottedCount}
                        />
                        <AllotmentStats results={filteredResults} />
                        <FlatList
                            data={filteredResults} keyExtractor={item => item.panNumber} renderItem={renderResultCard}
                            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 }}
                            onScrollBeginDrag={() => { if (activeMenuPan) setActiveMenuPan(null); }}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: colors.text, opacity: 0.6 }}>No results.</Text>}
                        />

                        {/* Floating Refresh Button */}
                        <TouchableOpacity
                            onPress={onRefresh}
                            disabled={shouldSpin}
                            style={{
                                position: 'absolute',
                                bottom: 24,
                                right: 24,
                                backgroundColor: colors.primary,
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: 6,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4.65,
                                zIndex: 100,
                                opacity: shouldSpin ? 0.8 : 1
                            }}
                        >
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <RotateCw color="#FFF" size={26} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                ) : hasError ? (
                    <View style={styles.centerContainer}>
                        <XCircle size={48} color={colors.notification} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Unable to check status</Text>
                        <Text style={{ color: colors.text, opacity: 0.6, marginTop: 4, textAlign: 'center', paddingHorizontal: 32 }}>We couldn't connect to the server or the registrar is unavailable.</Text>
                        <TouchableOpacity style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} onPress={() => checkAllotment()}>
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

            <AddPANBottomSheet visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddPan} requireName={true} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Easing, Share, RefreshControl, Alert, InteractionManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { XCircle } from 'lucide-react-native';
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
    const [hasError, setHasError] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

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
                    // And checking if we shouldn't force refresh for any reason?
                    // Let's just use the merge logic if counts mismatch.
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

            // (Old Step 2 removed)

            // 3. Prepare Initial Results (Merge with Cache/Existing to avoid resetting to WAITING if skipping API)
            let cachedResults: AllotmentResult[] = [];
            try {
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) cachedResults = JSON.parse(cachedData);
            } catch (e) { }

            const mergedResults: AllotmentResult[] = allPans.map(p => {
                const existing = cachedResults.find(r => r.panNumber === p.panNumber) || results.find(r => r.panNumber === p.panNumber);
                if (existing) {
                    // Update name/source if changed, keep status
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

            // 4. API Check Loop (Skip if requested or no registrar)
            if (skipApiCheck || !registrarKey) {
                // If skipping, ensuring we save the merged state to cache so we don't lose the "WAITING" entries or updates
                AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mergedResults));
                return;
            }

            // Reset statuses to CHECKING only for those we are about to check? 
            // Or just check everything? Logic above implied checking everything.
            // Let's reset all to WAITING/CHECKING loop as before.
            const initialLoopResults = mergedResults.map(r => ({ ...r, status: 'WAITING' as const, message: 'Waiting...' }));
            setResults(initialLoopResults);

            let completedCount = 0;
            let currentResultsState = [...initialLoopResults];

            for (let i = 0; i < allPans.length; i++) {
                const p = allPans[i];

                const previousState = mergedResults.find(r => r.panNumber === p.panNumber);
                const isCached = previousState && ['ALLOTTED', 'NOT_ALLOTTED', 'NOT_APPLIED'].includes(previousState.status);
                const shouldForce = !isCached;

                setResults(prev => prev.map(item => item.panNumber === p.panNumber ? { ...item, status: 'CHECKING', message: 'Checking...' } : item));

                try {
                    const response = await checkAllotmentStatus(ipoName, registrarKey, [p.panNumber], shouldForce);
                    const updateFunction = (item: AllotmentResult) => {
                        if (item.panNumber === p.panNumber) {
                            if (response.success && response.data.length > 0) {
                                const res = response.data[0];
                                let finalStatus = res.status;
                                let finalMessage = res.message || '';
                                if (finalMessage.includes('browserType.launch') || finalMessage.includes('playwright')) {
                                    finalStatus = 'NOT_APPLIED'; finalMessage = 'No record found';
                                }
                                return { ...item, status: finalStatus, units: res.units || 0, message: finalMessage, name: res.name || item.name, dpId: res.dpId };
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
                if (i < allPans.length - 1) await new Promise(r => setTimeout(r, 500));
            }
            setHasError(false);
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(currentResultsState));
        } catch (error) {
            console.error(error);
            setLoading(false);
            setHasError(true);
        }
    };

    const [filterSource, setFilterSource] = useState<'ALL' | 'CLOUD' | 'LOCAL'>('ALL');
    const filteredResults = results.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.panNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource = filterSource === 'ALL' ? true : item.source === filterSource;
        return matchesSearch && matchesSource;
    });

    const [activeMenuPan, setActiveMenuPan] = useState<string | null>(null);

    const handleRefreshPan = async (item: AllotmentResult) => {
        if (refreshingPans.has(item.panNumber)) return;
        const registrarKey = getRegistrarKey(ipo.registrarName || ipo.registrar || ipo.registrarLink);
        if (!registrarKey) { Alert.alert("Unsupported Registrar", "Manual check required."); return; }

        setRefreshingPans(prev => new Set(prev).add(item.panNumber));
        try {
            const response = await checkAllotmentStatus(ipoName, registrarKey, [item.panNumber], true);
            if (response.success && response.data.length > 0) {
                const res = response.data[0];
                setResults(prev => prev.map(r => r.panNumber === item.panNumber ? { ...r, status: res.status, units: res.units, message: res.message, name: res.name || r.name } : r));
            }
        } catch (error) { Alert.alert("Error", "Failed to refresh status."); }
        finally { setRefreshingPans(prev => { const next = new Set(prev); next.delete(item.panNumber); return next; }); }
    };

    const onRefresh = React.useCallback(async () => { await checkAllotment(true, false); }, [ipo.registrarName]);

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
            let newResult: AllotmentResult = { panNumber: data.panNumber, name: data.name || 'New PAN', status: 'CHECKING', message: 'Checking...', source: isAuthenticated ? 'CLOUD' : 'LOCAL' };

            if (isAuthenticated && user && token) {
                await addUserPAN(token, { panNumber: data.panNumber, name: data.name || '' });
                await refreshProfile();
                showToast({ message: "PAN saved to account", type: "success" });
            } else {
                const stored = await AsyncStorage.getItem('unsaved_pans');
                const currentPans = stored ? JSON.parse(stored) : [];
                if (!currentPans.some((p: any) => p.panNumber === data.panNumber)) {
                    await AsyncStorage.setItem('unsaved_pans', JSON.stringify([...currentPans, { id: Date.now().toString(), panNumber: data.panNumber, name: data.name }]));
                    showToast({ message: "PAN saved locally", type: "success" });
                }
            }

            let updatedList = [newResult, ...results];
            setResults(updatedList);
            setAllPanCount(prev => prev + 1);

            const registrarKey = getRegistrarKey(ipo.registrarName || ipo.registrar || ipo.registrarLink);
            if (registrarKey) {
                const response = await checkAllotmentStatus(ipoName, registrarKey, [data.panNumber], true);
                if (response.success && response.data.length > 0) {
                    const res = response.data[0];
                    updatedList = updatedList.map(item => item.panNumber === data.panNumber ? { ...item, status: res.status, units: res.units, message: res.message, name: res.name || item.name } : item);
                } else {
                    updatedList = updatedList.map(item => item.panNumber === data.panNumber ? { ...item, status: 'NOT_APPLIED', message: 'No record found' } : item);
                }
            } else {
                updatedList = updatedList.map(item => item.panNumber === data.panNumber ? { ...item, status: 'UNKNOWN', message: 'Registrar not supported' } : item);
            }
            setResults(updatedList);
            AsyncStorage.setItem(`ALLOTMENT_CACHE_${ipoName}`, JSON.stringify(updatedList));
        } catch (error) { Alert.alert("Error", "Failed to save/check PAN."); }
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
                            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}
                            onScrollBeginDrag={() => { if (activeMenuPan) setActiveMenuPan(null); }}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[colors.primary]} />}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: colors.text, opacity: 0.6 }}>No results.</Text>}
                            ListFooterComponent={<Text style={{ textAlign: 'center', fontSize: 12, color: colors.text, opacity: 0.4, marginTop: 24, marginBottom: 16 }}>Pull down to refresh and see updated results</Text>}
                        />
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

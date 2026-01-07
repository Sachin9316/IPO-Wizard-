import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { AddPANModal } from '../../components/AddPANModal';
import { Plus, CreditCard, Trash2, Edit, Cloud, CloudOff, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addUserPAN, deleteUserPAN, updateUserPAN } from '../../services/api'; // Import updateUserPAN
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUI } from '../../context/UIContext';
import { usePreferences } from '../../context/PreferencesContext';

interface PANData {
    id: string; // For local: timestamp. For cloud: _id or panNumber? API uses panNumber for delete.
    panNumber: string;
    name: string;
}

export const SavedPANsScreen = () => {
    const { colors } = useTheme();
    const { user, isAuthenticated, token, refreshProfile } = useAuth();
    const { showAlert, showToast } = useUI();
    const navigation = useNavigation<any>();
    const { isPanMasked } = usePreferences();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPAN, setEditingPAN] = useState<PANData | null>(null);
    const [localPans, setLocalPans] = useState<PANData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // Add refreshing state

    useEffect(() => {
        loadLocalPans();
        // Reload local pans whenever auth changes to ensure we have fresh state
    }, [isAuthenticated]);

    // Add useFocusEffect to refresh profile when navigating to this tab
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && refreshProfile) {
                refreshProfile();
            }
        }, [isAuthenticated])
    );

    const onRefresh = async () => {
        if (refreshProfile) {
            setRefreshing(true);
            await refreshProfile();
            setRefreshing(false);
        }
    };

    const loadLocalPans = async () => {
        try {
            const stored = await AsyncStorage.getItem('unsaved_pans');
            if (stored) {
                setLocalPans(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSyncPAN = async (pan: PANData) => {
        if (!isAuthenticated || !token) return;
        setIsLoading(true);
        try {
            await addUserPAN(token, { panNumber: pan.panNumber, name: pan.name });

            // Success: Remove from local storage
            const updated = localPans.filter(p => p.panNumber !== pan.panNumber);
            setLocalPans(updated);
            await AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));

            showToast({
                message: `PAN ${pan.panNumber} synced to cloud.`,
                type: 'success'
            });
            if (refreshProfile) refreshProfile(); // Refresh profile after sync
        } catch (e: any) {
            showAlert({
                title: "Sync Error",
                message: e.message,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPAN = async (data: { panNumber: string; name?: string }) => {
        const name = data.name || '';
        const panNumber = data.panNumber.toUpperCase();

        if (isAuthenticated && token) {
            // Cloud Logic
            setIsLoading(true);
            try {
                if (editingPAN) {
                    // Update existing
                    await updateUserPAN(token, panNumber, { name });
                    showToast({ message: "PAN updated successfully", type: 'success' });
                } else {
                    // Add new
                    await addUserPAN(token, { panNumber, name });
                    showToast({ message: "PAN added to your account", type: 'success' });
                }
                setModalVisible(false);
                setEditingPAN(null); // Reset editing state
                if (refreshProfile) refreshProfile(); // Refresh after add/update
            } catch (e: any) {
                showAlert({ title: "Error", message: e.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        } else {
            // Local Logic
            if (editingPAN) {
                const updated = localPans.map(p => p.id === editingPAN.id ? { ...p, panNumber, name } : p);
                setLocalPans(updated);
                AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
                setEditingPAN(null);
            } else {
                // Check dupes
                if (localPans.some(p => p.panNumber === panNumber)) {
                    showAlert({ title: "Duplicate", message: "PAN already exists locally.", type: 'warning' });
                    return;
                }
                const newPan = { id: Date.now().toString(), panNumber, name };
                const updated = [...localPans, newPan];
                setLocalPans(updated);
                AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
            }
            setModalVisible(false);
        }
    };

    const handleEditPAN = (pan: PANData) => {
        setEditingPAN(pan);
        setModalVisible(true);
    };

    const handleDeletePAN = async (id: string, panNumber: string, isCloud: boolean) => {
        if (isCloud && isAuthenticated && token) {
            showAlert({
                title: "Delete PAN",
                message: "Remove from cloud account?",
                type: 'warning',
                buttons: [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            setIsLoading(true);
                            try {
                                await deleteUserPAN(token, panNumber);
                                showToast({ message: "PAN deleted successfully", type: 'info' });
                                if (refreshProfile) refreshProfile(); // Refresh after delete
                            } catch (e: any) {
                                showAlert({ title: "Error", message: e.message, type: 'error' });
                            } finally {
                                setIsLoading(false);
                            }
                        }
                    }
                ]
            });
        } else {
            // Local delete
            const updated = localPans.filter(p => p.id !== id);
            setLocalPans(updated);
            AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
        }
    };

    // Filter Logic
    const cloudPans = isAuthenticated ? (user?.panDocuments?.map((p: any) => ({ ...p, id: p._id || p.panNumber })) || []) : [];

    // Unsaved = Local pans that are NOT in cloudPans
    const unsavedPans = localPans.filter(lp => !cloudPans.some((cp: any) => cp.panNumber === lp.panNumber));

    const renderPANCard = ({ item, isCloud }: { item: PANData, isCloud: boolean }) => (
        <View style={[styles.panCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: isCloud ? colors.primary + '20' : '#FF980020' }]}>
                    <CreditCard size={20} color={isCloud ? colors.primary : '#FF9800'} />
                </View>
                <View style={styles.panInfo}>
                    <Text style={[styles.panNumber, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.panName, { color: colors.text, opacity: 0.7 }]}>
                        {isPanMasked ? '******' + item.panNumber.slice(-4) : item.panNumber}
                    </Text>

                    {isCloud && (
                        <View style={styles.verifiedTag}>
                            <Cloud size={10} color={colors.primary} />
                            <Text style={{ fontSize: 9, color: colors.primary, marginLeft: 4 }}>Saved</Text>
                        </View>
                    )}

                    {!isCloud && isAuthenticated && (
                        <TouchableOpacity style={styles.syncLink} onPress={() => handleSyncPAN(item)}>
                            <Text style={{ fontSize: 10, color: '#FF9800', fontWeight: 'bold' }}>Not Saved • Tap to Sync</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.actionButtons}>
                {!isCloud && isAuthenticated && (
                    <TouchableOpacity style={[styles.editBtn, { marginRight: 4 }]} onPress={() => handleSyncPAN(item)}>
                        <Cloud size={16} color={colors.primary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPAN(item)}>
                    <Edit size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePAN(item.id, item.panNumber, isCloud)}
                >
                    <Trash2 size={16} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <View style={styles.header}>
                {isAuthenticated ? (
                    <View style={styles.statusRow}>
                        <Cloud size={16} color={colors.primary} />
                        <Text style={[styles.statusText, { color: colors.primary }]}>Logged In</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Root', { screen: 'Profile' })}>
                        <View style={styles.statusRow}>
                            <CloudOff size={16} color={colors.text} />
                            <Text style={[styles.statusText, { color: colors.text }]}>Local Mode</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: colors.primary, marginRight: 5, fontWeight: 'bold' }}>Login to Sync</Text>
                            <LogIn size={16} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ margin: 10 }} />}

            <FlatList
                data={[]}
                contentContainerStyle={{ flexGrow: 1 }}
                ListHeaderComponent={
                    <View style={{ padding: 16, flex: 1, justifyContent: (isAuthenticated && (cloudPans.length > 0 || unsavedPans.length > 0)) || (!isAuthenticated && unsavedPans.length > 0) ? 'flex-start' : 'center' }}>
                        {isAuthenticated && cloudPans.length > 0 && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Synced PANs ({cloudPans.length})</Text>
                                {cloudPans.map((pan: any) => (
                                    <View key={pan.id}>{renderPANCard({ item: pan, isCloud: true })}</View>
                                ))}
                            </View>
                        )}

                        {(unsavedPans.length > 0) && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Unsaved PANs ({unsavedPans.length})</Text>
                                <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5, marginBottom: 10 }}>Only stored on this device</Text>
                                {unsavedPans.map((pan: any) => (
                                    <View key={pan.id}>{renderPANCard({ item: pan, isCloud: false })}</View>
                                ))}
                            </View>
                        )}

                        {isAuthenticated && cloudPans.length === 0 && unsavedPans.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <CreditCard size={64} color={colors.text} style={{ opacity: 0.3 }} />
                                <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>No saved PANs</Text>
                                <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5, marginTop: 8 }}>Pull down to refresh</Text>
                            </View>
                        )}
                        {!isAuthenticated && unsavedPans.length === 0 && (
                            <View style={[styles.emptyContainer, { flex: 1, marginTop: 100 }]}>
                                <CreditCard size={64} color={colors.text} style={{ opacity: 0.2 }} />
                                <Text style={[styles.emptyText, { color: colors.text, opacity: 0.6, textAlign: 'center' }]}>
                                    Save multiple PANs and check the allotment in one click
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={null}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => {
                    setEditingPAN(null);
                    setModalVisible(true);
                }}
            >
                <Plus size={28} color="#fff" />
            </TouchableOpacity>

            <AddPANModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingPAN(null);
                }}
                onSubmit={handleAddPAN}
                requireName={true}
                editData={editingPAN}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingVertical: 8 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    loginBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed'
    },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', opacity: 0.7 },
    panCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 2,
    },
    panCardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10,
    },
    panInfo: { flex: 1 },
    panNumber: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    panName: { fontSize: 12 },
    verifiedTag: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    syncLink: { marginTop: 2 },
    actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    editBtn: { padding: 6 },
    deleteBtn: { padding: 6 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center', elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4,
    },
});

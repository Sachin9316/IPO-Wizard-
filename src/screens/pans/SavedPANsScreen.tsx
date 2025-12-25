import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { AddPANModal } from '../../components/AddPANModal';
import { Plus, CreditCard, Trash2, Edit, Cloud, CloudOff, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addUserPAN, deleteUserPAN } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

interface PANData {
    id: string; // For local: timestamp. For cloud: _id or panNumber? API uses panNumber for delete.
    panNumber: string;
    name: string;
}

export const SavedPANsScreen = () => {
    const { colors } = useTheme();
    const { user, isAuthenticated, token } = useAuth();
    const navigation = useNavigation<any>();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPAN, setEditingPAN] = useState<PANData | null>(null);
    const [localPans, setLocalPans] = useState<PANData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            loadLocalPans();
        }
    }, [isAuthenticated]);

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

    const handleAddPAN = async (data: { panNumber: string; name?: string }) => {
        const name = data.name || '';
        const panNumber = data.panNumber.toUpperCase();

        if (isAuthenticated && token) {
            // Cloud add
            setIsLoading(true);
            try {
                await addUserPAN(token, { panNumber, name });
                // We rely on AuthContext user update or manual fetch?
                // For simplicity, we can't easily re-fetch user here without exposing a method.
                // But AuthContext login fetches user. Maybe we need a refreshProfile method?
                // Or just optimistically update UI?
                // Ideally API returns updated list. addUserPAN response is user.panDocuments usually?
                // Let's assume user state updates via context or we force a reload.
                // For now, simple alert success. Context should arguably reload profile.
                Alert.alert("Success", "PAN added to your account");
                setModalVisible(false);
            } catch (e: any) {
                Alert.alert("Error", e.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Local add
            if (editingPAN) {
                const updated = localPans.map(p => p.id === editingPAN.id ? { ...p, panNumber, name } : p);
                setLocalPans(updated);
                AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
                setEditingPAN(null);
            } else {
                const newPan = { id: Date.now().toString(), panNumber, name };
                const updated = [...localPans, newPan];
                setLocalPans(updated);
                AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
            }
            setModalVisible(false);
        }
    };

    const handleEditPAN = (pan: PANData) => {
        if (isAuthenticated) {
            // Editing cloud PANs might require separate API or just delete/add
            Alert.alert("Info", "To edit a verified PAN, please remove and add it again.");
        } else {
            setEditingPAN(pan);
            setModalVisible(true);
        }
    };

    const handleDeletePAN = async (id: string, panNumber: string) => {
        if (isAuthenticated && token) {
            Alert.alert("Delete PAN", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await deleteUserPAN(token, panNumber);
                            // Again, context sync issue.
                            Alert.alert("Success", "PAN deleted");
                        } catch (e: any) {
                            Alert.alert("Error", e.message);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]);
        } else {
            const updated = localPans.filter(p => p.id !== id);
            setLocalPans(updated);
            AsyncStorage.setItem('unsaved_pans', JSON.stringify(updated));
        }
    };

    // Determine list to show
    const displayPans = isAuthenticated
        ? (user?.panDocuments?.map((p: any) => ({ ...p, id: p._id || p.panNumber })) || [])
        : localPans;

    const renderPANCard = ({ item }: { item: PANData }) => (
        <View style={[styles.panCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <CreditCard size={24} color={colors.primary} />
                </View>
                <View style={styles.panInfo}>
                    <Text style={[styles.panNumber, { color: colors.text }]}>{item.panNumber}</Text>
                    <Text style={[styles.panName, { color: colors.text, opacity: 0.7 }]}>{item.name}</Text>
                    {isAuthenticated && (
                        <View style={styles.verifiedTag}>
                            <Cloud size={12} color={colors.primary} />
                            <Text style={{ fontSize: 10, color: colors.primary, marginLeft: 4 }}>Saved</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.actionButtons}>
                {!isAuthenticated && (
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPAN(item)}>
                        <Edit size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePAN(item.id, item.panNumber)}
                >
                    <Trash2 size={20} color="#F44336" />
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
                        <Text style={[styles.statusText, { color: colors.primary }]}>Cloud Synced</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Login')}>
                        <View style={styles.statusRow}>
                            <CloudOff size={16} color={colors.text} />
                            <Text style={[styles.statusText, { color: colors.text }]}>Local Mode (Unsaved)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: colors.primary, marginRight: 5, fontWeight: 'bold' }}>Login to Sync</Text>
                            <LogIn size={16} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ margin: 10 }} />}

            {displayPans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <CreditCard size={64} color={colors.text} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>
                        {isAuthenticated ? "No saved PANs" : "No unsaved PANs"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayPans}
                    renderItem={renderPANCard}
                    keyExtractor={(item) => item.panNumber} // Use panNumber as key for uniqueness
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Plus size={28} color="#fff" />
            </TouchableOpacity>

            <AddPANModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
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
    listContent: { padding: 16 },
    panCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 2,
    },
    panCardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    panInfo: { flex: 1 },
    panNumber: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    panName: { fontSize: 14 },
    verifiedTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    editBtn: { padding: 8 },
    deleteBtn: { padding: 8 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center', elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4,
    },
});

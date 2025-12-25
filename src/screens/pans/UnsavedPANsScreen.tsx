import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { AddPANModal } from '../../components/AddPANModal';
import { Plus, CreditCard, Trash2, Edit, CloudUpload } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { addUserPAN } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

interface PANData {
    id: string;
    panNumber: string;
    name?: string;
}

export const UnsavedPANsScreen = () => {
    const { colors } = useTheme();
    const { isAuthenticated, token, refreshProfile } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPAN, setEditingPAN] = useState<PANData | null>(null);
    const [pans, setPans] = useState<PANData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadPans();
        }, [])
    );

    const loadPans = async () => {
        try {
            const stored = await AsyncStorage.getItem('unsaved_pans');
            if (stored) {
                setPans(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const savePans = async (newPans: PANData[]) => {
        setPans(newPans);
        await AsyncStorage.setItem('unsaved_pans', JSON.stringify(newPans));
    };

    const handleAddPAN = async (data: { panNumber: string, name?: string }) => {
        if (editingPAN) {
            const updated = pans.map(pan =>
                pan.id === editingPAN.id
                    ? { ...pan, panNumber: data.panNumber, name: data.name }
                    : pan
            );
            await savePans(updated);
            setEditingPAN(null);
        } else {
            // Check duplicates
            if (pans.some(p => p.panNumber === data.panNumber)) {
                Alert.alert("Duplicate", "This PAN is already in your unsaved list.");
                return;
            }
            const newPAN: PANData = {
                id: Date.now().toString(),
                panNumber: data.panNumber,
                name: data.name
            };
            await savePans([...pans, newPAN]);
        }
        setModalVisible(false);
    };

    const handleEditPAN = (pan: PANData) => {
        setEditingPAN(pan);
        setModalVisible(true);
    };

    const handleDeletePAN = async (id: string) => {
        Alert.alert("Delete", "Remove this PAN from local storage?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const updated = pans.filter(pan => pan.id !== id);
                    await savePans(updated);
                }
            }
        ]);
    };

    const handleSync = async (pan: PANData) => {
        if (!isAuthenticated || !token) {
            Alert.alert("Login Required", "Please login to sync your PANs.");
            return;
        }

        setIsLoading(true);
        try {
            await addUserPAN(token, { panNumber: pan.panNumber.toUpperCase(), name: pan.name || '' });

            // Remove from local on success
            const updated = pans.filter(p => p.id !== pan.id);
            await savePans(updated);

            Alert.alert("Synced", "PAN synced successfully!");
            if (refreshProfile) await refreshProfile();
        } catch (error: any) {
            Alert.alert("Sync Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPANCard = ({ item }: { item: PANData }) => (
        <View style={[styles.panCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF980020' }]}>
                    <CreditCard size={24} color="#FF9800" />
                </View>
                <View style={styles.panInfo}>
                    <Text style={[styles.panNumber, { color: colors.text }]}>{item.panNumber}</Text>
                    <Text style={[styles.panSubtext, { color: colors.text, opacity: 0.5 }]}>
                        {item.name || "Unsaved Local PAN"}
                    </Text>
                    {isAuthenticated && (
                        <TouchableOpacity style={styles.syncLink} onPress={() => handleSync(item)}>
                            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>
                                Not Saved • Tap to Sync
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.actionButtons}>
                {isAuthenticated && (
                    <TouchableOpacity
                        style={[styles.editBtn, { marginRight: 4 }]}
                        onPress={() => handleSync(item)}
                    >
                        <CloudUpload size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditPAN(item)}
                >
                    <Edit size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletePAN(item.id)}
                >
                    <Trash2 size={20} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>

            {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ margin: 10 }} />}

            {pans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <CreditCard size={64} color={colors.text} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>
                        No unsaved PANs
                    </Text>
                    <Text style={[styles.emptySubText, { color: colors.text, opacity: 0.4 }]}>
                        Tap + to add a local temporary PAN
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pans}
                    renderItem={renderPANCard}
                    keyExtractor={(item) => item.id}
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
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    panCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    panCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    panInfo: {
        flex: 1,
    },
    panNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    panSubtext: {
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editBtn: {
        padding: 8,
    },
    deleteBtn: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

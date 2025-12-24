import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { AddPANModal } from '../../components/AddPANModal';
import { Plus, CreditCard, Trash2, Edit } from 'lucide-react-native';

interface PANData {
    id: string;
    panNumber: string;
    name: string;
}

export const SavedPANsScreen = () => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPAN, setEditingPAN] = useState<PANData | null>(null);
    const [pans, setPans] = useState<PANData[]>([
        { id: '1', panNumber: 'ABCDE1234F', name: 'Rajesh Kumar' },
        { id: '2', panNumber: 'PQRST5678G', name: 'Priya Sharma' },
        { id: '3', panNumber: 'LMNOP9012H', name: 'Amit Patel' },
        { id: '4', panNumber: 'UVWXY3456J', name: 'Sneha Reddy' },
    ]);

    const handleAddPAN = (data: { panNumber: string; name?: string }) => {
        if (editingPAN) {
            // Update existing PAN
            setPans(pans.map(pan =>
                pan.id === editingPAN.id
                    ? { ...pan, panNumber: data.panNumber, name: data.name || '' }
                    : pan
            ));
            setEditingPAN(null);
        } else {
            // Add new PAN
            const newPAN: PANData = {
                id: Date.now().toString(),
                panNumber: data.panNumber,
                name: data.name || '',
            };
            setPans([...pans, newPAN]);
        }
    };

    const handleEditPAN = (pan: PANData) => {
        setEditingPAN(pan);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingPAN(null);
    };

    const handleDeletePAN = (id: string) => {
        setPans(pans.filter(pan => pan.id !== id));
    };

    const renderPANCard = ({ item }: { item: PANData }) => (
        <View style={[styles.panCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <CreditCard size={24} color={colors.primary} />
                </View>
                <View style={styles.panInfo}>
                    <Text style={[styles.panNumber, { color: colors.text }]}>{item.panNumber}</Text>
                    <Text style={[styles.panName, { color: colors.text, opacity: 0.7 }]}>{item.name}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
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
            {pans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <CreditCard size={64} color={colors.text} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyText, { color: colors.text, opacity: 0.5 }]}>
                        No saved PANs yet
                    </Text>
                    <Text style={[styles.emptySubText, { color: colors.text, opacity: 0.4 }]}>
                        Tap the + button to add a PAN
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
                onClose={handleCloseModal}
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
    panName: {
        fontSize: 14,
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

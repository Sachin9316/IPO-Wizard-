import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { X, Search } from 'lucide-react-native';
import { fetchMainboardIPOs } from '../services/api';
import { mapBackendToFrontend } from '../utils/mapper';
import { IPOData } from '../types/ipo';

interface IPOSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (ipo: IPOData) => void;
    currentItemId: string;
}

export const IPOSelectionModal = ({ visible, onClose, onSelect, currentItemId }: IPOSelectionModalProps) => {
    const { colors } = useTheme();
    const [ipos, setIpos] = useState<IPOData[]>([]);
    const [filteredIpos, setFilteredIpos] = useState<IPOData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            loadIpos();
        }
    }, [visible]);

    const loadIpos = async () => {
        setLoading(true);
        try {
            const data = await fetchMainboardIPOs(1);
            const mapped = data.map(mapBackendToFrontend).filter((item: IPOData) => item.id !== currentItemId);
            setIpos(mapped);
            setFilteredIpos(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const filtered = ipos.filter(ipo =>
                ipo.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredIpos(filtered);
        } else {
            setFilteredIpos(ipos);
        }
    };

    const renderItem = ({ item }: { item: IPOData }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => onSelect(item)}
        >
            <View style={[styles.logoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <Text style={{ fontSize: 8, color: colors.text }}>LOGO</Text>
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemType, { color: colors.primary }]}>{item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select IPO to Compare</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color={colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Search size={18} color={colors.text} opacity={0.5} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search IPO..."
                            placeholderTextColor={colors.text + '80'}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                    ) : (
                        <FlatList
                            data={filteredIpos}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text, opacity: 0.5 }}>
                                    No IPOs found
                                </Text>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    logoContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
    logo: { width: '80%', height: '80%' },
    itemName: { fontSize: 15, fontWeight: '600' },
    itemType: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
});

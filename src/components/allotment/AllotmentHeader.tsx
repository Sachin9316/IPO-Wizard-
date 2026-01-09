import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface AllotmentHeaderProps {
    onAddPress: () => void;
}

export const AllotmentHeader = ({ onAddPress }: AllotmentHeaderProps) => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Allotment Status</Text>

            <TouchableOpacity
                onPress={onAddPress}
                style={{ padding: 4, backgroundColor: colors.primary + '20', borderRadius: 8 }}
            >
                <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeBtn: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
});

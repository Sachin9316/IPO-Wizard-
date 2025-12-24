import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { DUMMY_IPOS, ALLOTED_IPOS, IPOData } from '../data/dummyData';
import { IPOCard } from '../components/IPOCard';
import { useNavigation } from '@react-navigation/native';

interface IPOListScreenProps {
    type: 'SME' | 'Mainboard' | 'Alloted';
}

export const IPOListScreen = ({ route }: { route: { params: IPOListScreenProps } }) => {
    const { type } = route.params || { type: 'Mainboard' };
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const data = type === 'Alloted'
        ? ALLOTED_IPOS
        : DUMMY_IPOS.filter(ipo => ipo.type === type);

    const handlePress = (item: IPOData) => {
        navigation.navigate('IPODetails', { item });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={data}
                renderItem={({ item }) => <IPOCard item={item} onPress={handlePress} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>No IPOs found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { IPOData } from '../data/dummyData';
import { TrendingUp, Users, Calendar, CircleDollarSign } from 'lucide-react-native';

interface IPOCardProps {
    item: IPOData;
    onPress: (item: IPOData) => void;
}

export const IPOCard = ({ item, onPress }: IPOCardProps) => {
    const { colors } = useTheme();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return '#4CAF50';
            case 'Closed': return '#F44336';
            case 'Upcoming': return '#FF9800';
            default: return colors.text;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.border }]}>
                        <Text style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>IMG</Text>
                    </View>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.subTitle, { color: colors.text, opacity: 0.6 }]}>{item.type}</Text>
                    </View>
                </View>
                <View style={[styles.badgeContainer, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={[styles.infoFooter, { backgroundColor: colors.background + '80', borderTopColor: colors.border }]}>
                <View style={styles.infoItem}>
                    <CircleDollarSign size={14} color={colors.text} style={{ opacity: 0.6, marginBottom: 2 }} />
                    <Text style={[styles.infoValue, { color: colors.text }]}>{item.priceRange}</Text>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Price</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                    <TrendingUp size={14} color='#4CAF50' style={{ marginBottom: 2 }} />
                    <Text style={[styles.infoValue, { color: '#4CAF50' }]}>{item.gmp}</Text>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>GMP</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                    <Users size={14} color={colors.primary} style={{ marginBottom: 2 }} />
                    <Text style={[styles.infoValue, { color: colors.text }]}>{item.subscription}</Text>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Sub</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subTitle: {
        fontSize: 12,
    },
    badgeContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    statusBadge: {
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    infoFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderTopWidth: 1,
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    infoLabel: {
        fontSize: 10,
        opacity: 0.6,
    },
    divider: {
        width: 1,
        backgroundColor: '#ccc',
        opacity: 0.2,
        height: '80%',
        alignSelf: 'center',
    }
});

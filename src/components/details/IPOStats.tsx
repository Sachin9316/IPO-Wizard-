import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, IndianRupee, Layers, PieChart, TrendingUp, Users } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import moment from 'moment';

interface IPOStatsProps {
    item: IPOData;
}

const StatusBarItem = ({ label, value, valueColor, colors, icon }: any) => (
    <View style={styles.statusBarItem}>
        {icon}
        <View style={styles.statContent}>
            <Text style={[styles.statusLabel, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.statusValue, { color: valueColor || colors.text }]} numberOfLines={1}>{value || '-'}</Text>
        </View>
    </View>
);

export const IPOStats = ({ item }: IPOStatsProps) => {
    const { colors } = useTheme();

    return (
        <View style={styles.statsGrid}>
            <StatusBarItem
                icon={<Calendar size={16} color={colors.text} opacity={0.6} />}
                label="Offer Dates"
                value={`${moment(item.rawDates?.offerStart).format('DD MMM')} - ${moment(item.rawDates?.offerEnd).format('DD MMM')}`}
                colors={colors}
            />
            <StatusBarItem
                icon={<IndianRupee size={16} color={colors.text} opacity={0.6} />}
                label="Price Range"
                value={item.priceRange}
                colors={colors}
            />
            <StatusBarItem
                icon={<Layers size={16} color={colors.text} opacity={0.6} />}
                label="Lot Size"
                value={item.lotSize}
                colors={colors}
            />
            <StatusBarItem
                icon={<PieChart size={16} color={colors.text} opacity={0.6} />}
                label="Issue Size"
                value={item.issueSize}
                colors={colors}
            />
            <StatusBarItem
                icon={<TrendingUp size={16} color={item.gmp?.includes('+') ? '#4CAF50' : colors.text} opacity={0.8} />}
                label="GMP"
                value={item.gmp}
                valueColor={item.gmp?.includes('+') ? '#4CAF50' : undefined}
                colors={colors}
            />
            <StatusBarItem
                icon={<Users size={16} color={colors.text} opacity={0.6} />}
                label="Subs."
                value={item.subscription}
                colors={colors}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
        justifyContent: 'space-between',
    },
    statusBarItem: {
        width: '48%',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
        borderRadius: 12,
        gap: 10,
    },
    statContent: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.5,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 13,
        fontWeight: '700',
    },
});

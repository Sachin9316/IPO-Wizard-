import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SubscriptionHeroProps {
    total: number;
}

export const SubscriptionHero = ({ total }: SubscriptionHeroProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
            <View>
                <Text style={styles.heroLabel}>Total Subscription</Text>
                <Text style={styles.heroValue}>{total}x</Text>
                <Text style={styles.heroSub}>Overall demand for this IPO</Text>
            </View>
            <View style={styles.heroIcon}>
                <TrendingUp size={40} color="#FFF" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    heroCard: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    heroValue: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    heroIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

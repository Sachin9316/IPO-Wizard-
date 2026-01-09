import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AllotmentResult {
    panNumber: string;
    name: string;
    status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED' | 'ERROR' | 'UNKNOWN';
}

interface AllotmentStatsProps {
    results: AllotmentResult[];
}

export const AllotmentStats = ({ results }: AllotmentStatsProps) => {
    const { colors } = useTheme();

    // Filter logic matches the screen
    const appliedCount = results.filter(r => r.status !== 'NOT_APPLIED').length;
    const allottedCount = results.filter(r => r.status === 'ALLOTTED').length;
    const notAllottedCount = results.filter(r => r.status === 'NOT_ALLOTTED').length;
    const notAppliedCount = results.filter(r => r.status === 'NOT_APPLIED').length;

    return (
        <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statCount, { color: colors.primary }]}>{appliedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Applied</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statCount, { color: '#15803d' }]}>{allottedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Allotted</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statCount, { color: '#b91c1c' }]}>{notAllottedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Not Allotted</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statCount, { color: colors.text, opacity: 0.6 }]}>{notAppliedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.text, opacity: 0.6 }]}>Not Applied</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    statBox: {
        flex: 1,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    statCount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center'
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center'
    },
});

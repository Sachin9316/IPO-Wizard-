import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';

interface IPOHeroProps {
    item: IPOData;
}

export const IPOHero = ({ item }: IPOHeroProps) => {
    const { colors } = useTheme();

    return (
        <View style={styles.compactHeader}>
            <View style={styles.heroContainer}>
                <View style={styles.logoContainerLarge}>
                    {item.logoUrl ? (
                        <Image source={{ uri: item.logoUrl }} style={styles.logoLarge} resizeMode="contain" />
                    ) : (
                        <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
                    )}
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.companyNameLarge, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.badgesRow}>
                        <View style={[styles.badgePill, { borderColor: colors.primary, paddingVertical: 2, paddingHorizontal: 6 }]}>
                            <Text style={[styles.badgeText, { color: colors.primary, fontSize: 10 }]}>{item.type}</Text>
                        </View>
                        <View style={[styles.badgePill, { borderColor: item.status === 'Open' ? '#4CAF50' : '#888', paddingVertical: 2, paddingHorizontal: 6 }]}>
                            <Text style={[styles.badgeText, { color: item.status === 'Open' ? '#4CAF50' : '#888', fontSize: 10 }]}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    compactHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    heroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: 16,
    },
    logoContainerLarge: {
        width: 56,
        height: 56,
        borderRadius: 14,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logoLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    companyNameLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgePill: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});

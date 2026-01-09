import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SubscriptionCardProps {
    label: string;
    value: number;
    maxVal: number;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const ProgressBar = ({ value, maxVal, color, colors }: { value: number, maxVal: number, color: string, colors: any }) => {
    const width = maxVal > 0 ? (value / maxVal) * 100 : 0;
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: width,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [width]);

    return (
        <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <Animated.View
                style={{
                    width: animatedWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                    }),
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 3
                }}
            />
        </View>
    );
};

export const SubscriptionCard = ({ label, value, maxVal, icon, color, description }: SubscriptionCardProps) => {
    const { colors } = useTheme();

    const calculateChance = (val: number) => {
        if (val <= 1) return "Certain Allotment";
        if (val > 1) return `1 out of ${Math.round(val)}`;
        return "N/A";
    };

    const chance = calculateChance(value);

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    {icon}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardLabel, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.cardDesc, { color: colors.text }]}>{description}</Text>
                </View>
            </View>
            <View style={{ marginTop: 12 }}>
                <Text style={[styles.cardValue, { color: colors.text }]}>{value}x</Text>
                <ProgressBar value={value} maxVal={maxVal} color={color} colors={colors} />
                <View style={[styles.chanceBadge, { backgroundColor: `${color}15`, marginTop: 8 }]}>
                    <Text style={[styles.chanceText, { color: color }]}>
                        Chance: {chance}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardDesc: {
        fontSize: 11,
        opacity: 0.5,
        marginTop: 2,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chanceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    chanceText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const SkeletonItem = () => {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
                <View style={styles.left}>
                    {/* Name Placeholder */}
                    <Animated.View style={[styles.namePlaceholder, { backgroundColor: colors.border, opacity }]} />
                    {/* PAN Placeholder */}
                    <Animated.View style={[styles.panPlaceholder, { backgroundColor: colors.border, opacity }]} />
                </View>
                {/* Status Badge Placeholder */}
                <Animated.View style={[styles.badgePlaceholder, { backgroundColor: colors.border, opacity }]} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Message/Stats Placeholder */}
            <View style={styles.footer}>
                <Animated.View style={[styles.messagePlaceholder, { backgroundColor: colors.border, opacity }]} />
            </View>
        </View>
    );
};

export const AllotmentSkeleton = () => {
    return (
        <View style={styles.container}>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    left: {
        flex: 1,
    },
    namePlaceholder: {
        height: 18,
        width: '60%',
        borderRadius: 4,
        marginBottom: 8,
    },
    panPlaceholder: {
        height: 14,
        width: '40%',
        borderRadius: 4,
    },
    badgePlaceholder: {
        height: 24,
        width: 80,
        borderRadius: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
        opacity: 0.5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messagePlaceholder: {
        height: 14,
        width: '80%',
        borderRadius: 4,
    }
});

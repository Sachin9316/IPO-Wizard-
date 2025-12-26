import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const SkeletonIPOCard = () => {
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
            <View style={styles.header}>
                <View style={styles.leftSide}>
                    <Animated.View style={[styles.title, { backgroundColor: colors.border, opacity }]} />
                    <Animated.View style={[styles.subtitle, { backgroundColor: colors.border, opacity }]} />
                </View>
                <View style={styles.rightSide}>
                    <Animated.View style={[styles.badge, { backgroundColor: colors.border, opacity }]} />
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Animated.View style={[styles.statLabel, { backgroundColor: colors.border, opacity }]} />
                    <Animated.View style={[styles.statValue, { backgroundColor: colors.border, opacity }]} />
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.statBox}>
                    <Animated.View style={[styles.statLabel, { backgroundColor: colors.border, opacity }]} />
                    <Animated.View style={[styles.statValue, { backgroundColor: colors.border, opacity }]} />
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.statBox}>
                    <Animated.View style={[styles.statLabel, { backgroundColor: colors.border, opacity }]} />
                    <Animated.View style={[styles.statValue, { backgroundColor: colors.border, opacity }]} />
                </View>
            </View>

            <Animated.View style={[styles.footer, { backgroundColor: colors.border, opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    leftSide: {
        flex: 1,
    },
    title: {
        height: 20,
        width: '70%',
        borderRadius: 4,
        marginBottom: 8,
    },
    subtitle: {
        height: 12,
        width: '40%',
        borderRadius: 4,
    },
    rightSide: {
        alignItems: 'flex-end',
    },
    badge: {
        height: 24,
        width: 80,
        borderRadius: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginBottom: 4,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        height: 10,
        width: 40,
        borderRadius: 2,
        marginBottom: 6,
    },
    statValue: {
        height: 14,
        width: 60,
        borderRadius: 4,
    },
    divider: {
        width: 1,
        height: '70%',
        alignSelf: 'center',
    },
    footer: {
        height: 12,
        width: '90%',
        borderRadius: 4,
        marginTop: 12,
    },
});

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const SkeletonPANCard = () => {
    const { colors } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
                <Animated.View style={[styles.iconSkeleton, { backgroundColor: colors.border, opacity }]} />
                <View style={styles.infoContainer}>
                    <Animated.View style={[styles.textSkeleton, { width: '40%', height: 16, marginBottom: 8, backgroundColor: colors.border, opacity }]} />
                    <Animated.View style={[styles.textSkeleton, { width: '70%', height: 14, backgroundColor: colors.border, opacity }]} />
                </View>
            </View>
            <Animated.View style={[styles.actionSkeleton, { backgroundColor: colors.border, opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconSkeleton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    textSkeleton: {
        borderRadius: 4,
    },
    actionSkeleton: {
        width: 36,
        height: 20,
        borderRadius: 4,
    },
});

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const SkeletonDetail = () => {
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
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <Animated.View style={[styles.sectionTitle, { backgroundColor: colors.border, opacity }]} />
                <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.detailItem}>
                        <Animated.View style={[styles.label, { backgroundColor: colors.border, opacity }]} />
                        <Animated.View style={[styles.value, { backgroundColor: colors.border, opacity }]} />
                    </View>
                    <View style={styles.detailItem}>
                        <Animated.View style={[styles.label, { backgroundColor: colors.border, opacity }]} />
                        <Animated.View style={[styles.value, { backgroundColor: colors.border, opacity }]} />
                    </View>
                </View>
                <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}>
                    <View style={styles.detailItem}>
                        <Animated.View style={[styles.label, { backgroundColor: colors.border, opacity }]} />
                        <Animated.View style={[styles.value, { backgroundColor: colors.border, opacity }]} />
                    </View>
                    <View style={styles.detailItem}>
                        <Animated.View style={[styles.label, { backgroundColor: colors.border, opacity }]} />
                        <Animated.View style={[styles.value, { backgroundColor: colors.border, opacity }]} />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Animated.View style={[styles.sectionTitle, { backgroundColor: colors.border, opacity }]} />
                <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={[styles.timelineItem, i !== 5 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Animated.View style={[styles.icon, { backgroundColor: colors.border, opacity }]} />
                                <Animated.View style={[styles.label, { backgroundColor: colors.border, opacity, width: 80 }]} />
                            </View>
                            <Animated.View style={[styles.value, { backgroundColor: colors.border, opacity, width: 100 }]} />
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Animated.View style={[styles.sectionTitle, { backgroundColor: colors.border, opacity, width: 100 }]} />
                <View style={styles.grid}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.gridItem}>
                            <Animated.View style={[styles.gridCircle, { backgroundColor: colors.border, opacity }]} />
                            <Animated.View style={[styles.gridLabel, { backgroundColor: colors.border, opacity }]} />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        height: 20,
        width: 120,
        borderRadius: 4,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    detailItem: {
        flex: 1,
    },
    label: {
        height: 10,
        width: 60,
        borderRadius: 2,
        marginBottom: 8,
    },
    value: {
        height: 16,
        width: 80,
        borderRadius: 4,
    },
    timelineCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    timelineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridItem: {
        alignItems: 'center',
        width: 60,
    },
    gridCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 8,
    },
    gridLabel: {
        height: 10,
        width: 40,
        borderRadius: 2,
    },
});

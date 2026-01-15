import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import moment from 'moment';
import { Check, Clock, Calendar } from 'lucide-react-native';

interface IPOTimelineProps {
    item: IPOData;
}

const PulseIndicator = ({ color }: { color: string }) => {
    const anim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1.5,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.pulseRing,
                {
                    backgroundColor: color,
                    transform: [{ scale: anim }],
                    opacity: 0.3,
                },
            ]}
        />
    );
};

export const IPOTimeline = ({ item }: IPOTimelineProps) => {
    const { colors } = useTheme();

    const getStepStatus = (rawDateStr: string | undefined): 'completed' | 'active' | 'future' => {
        if (!rawDateStr) return 'future';
        const now = moment().startOf('day');
        const targetDate = moment(rawDateStr).startOf('day');

        if (now.isSame(targetDate, 'day')) return 'active';
        if (now.isAfter(targetDate, 'day')) return 'completed';
        return 'future';
    };

    const listingStatus = getStepStatus(item.rawDates?.listing);

    // Calculate refund date (Allotment + 1 day)
    let refundDate: string | undefined;
    if (item.rawDates?.allotment) {
        refundDate = moment(item.rawDates.allotment).add(1, 'days').toISOString();
    }

    const steps = [
        { label: 'Open', date: item.rawDates?.offerStart, status: getStepStatus(item.rawDates?.offerStart) },
        { label: 'Close', date: item.rawDates?.offerEnd, status: getStepStatus(item.rawDates?.offerEnd) },
        { label: 'Allotment', date: item.rawDates?.allotment, status: getStepStatus(item.rawDates?.allotment) },
        { label: 'Refunds', date: refundDate, status: getStepStatus(refundDate) },
        { label: listingStatus === 'completed' ? 'Listed' : 'Listing', date: item.rawDates?.listing, status: listingStatus },
    ];

    // Determine the "Current Phase" (index of the first non-completed step)
    let currentPhaseIndex = steps.findIndex(s => s.status !== 'completed');
    if (currentPhaseIndex === -1) currentPhaseIndex = steps.length - 1; // All completed

    // Special logic: If "Close" is future, but "Open" is completed, we are currently in "Subscription" phase.
    // The "Active" visual focus should be on the NEXT milestone.

    return (
        <View style={styles.sectionCompact}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 }}>
                <Text style={[styles.sectionTitleCompact, { color: colors.text, marginBottom: 0 }]}>Timeline</Text>
            </View>

            <View style={styles.timelineContainer}>
                {/* Background Line */}
                <View style={[styles.lineBase, { backgroundColor: colors.border }]} />

                {/* Foreground Lines */}
                <View style={styles.lineContainer}>
                    {steps.slice(0, steps.length - 1).map((_, i) => {
                        const isFilled = steps[i].status === 'completed';
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.lineSegment,
                                    { backgroundColor: isFilled ? colors.primary : 'transparent' }
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Steps */}
                <View style={styles.stepsRow}>
                    {steps.map((step, index) => {
                        const isCompleted = step.status === 'completed';
                        const isActive = step.status === 'active';
                        const isUpNext = !isCompleted && !isActive && index === currentPhaseIndex;

                        let displayDate = 'TBA';
                        let relativeTime = '';

                        if (step.date) {
                            const d = moment(step.date);
                            displayDate = d.format('DD MMM');

                            const now = moment().startOf('day');
                            const diff = d.diff(now, 'days');

                            if (diff === 0) relativeTime = 'Today';
                            else if (diff === 1) relativeTime = 'Tomorrow';
                            else if (diff > 1 && diff < 5) relativeTime = `in ${diff} days`;
                            else if (diff === -1) relativeTime = 'Yesterday';
                        }

                        const WAITING_COLOR = '#FFB300';

                        return (
                            <View key={index} style={styles.stepItem}>
                                {(isActive || isUpNext) && <PulseIndicator color={WAITING_COLOR} />}

                                <View style={[
                                    styles.circle,
                                    {
                                        backgroundColor: isCompleted ? colors.primary : (isActive ? WAITING_COLOR : colors.card),
                                        borderColor: isCompleted ? colors.primary : (isActive || isUpNext ? WAITING_COLOR : colors.border),
                                        borderWidth: 2,
                                    }
                                ]}>
                                    {isCompleted ? (
                                        <Check size={12} color="#FFF" strokeWidth={3} />
                                    ) : isActive ? (
                                        <View style={[styles.activeDot, { backgroundColor: '#FFF' }]} />
                                    ) : isUpNext ? (
                                        <View style={[styles.activeDot, { backgroundColor: WAITING_COLOR }]} />
                                    ) : (
                                        <View style={styles.inactiveDot} />
                                    )}
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={[
                                        styles.label,
                                        {
                                            color: (isActive || isUpNext) ? WAITING_COLOR : colors.text,
                                            opacity: isCompleted || isActive || isUpNext ? 1 : 0.5
                                        }
                                    ]} numberOfLines={1}>{step.label}</Text>
                                    <Text style={[styles.date, { color: colors.text, opacity: isCompleted ? 0.6 : 0.9 }]}>
                                        {displayDate}
                                    </Text>
                                    {(isActive || isUpNext) && relativeTime ? (
                                        <Text style={[styles.relativeTime, { color: WAITING_COLOR }]}>{relativeTime}</Text>
                                    ) : null}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionCompact: {
        paddingVertical: 16,
        paddingBottom: 24,
    },
    sectionTitleCompact: {
        fontSize: 18,
        fontWeight: '700',
    },
    timelineContainer: {
        position: 'relative',
        justifyContent: 'center',
        marginTop: 10,
    },
    lineBase: {
        position: 'absolute',
        top: 12,
        left: 32,
        right: 32,
        height: 3,
        borderRadius: 1.5,
        zIndex: 1,
    },
    lineContainer: {
        position: 'absolute',
        top: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 32,
        height: 3,
        zIndex: 2,
    },
    lineSegment: {
        flex: 1,
        height: 3,
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 3,
    },
    stepItem: {
        alignItems: 'center',
        width: 65, // Reduced from 80 to fit 5 items (360 / 5 = 72 max)
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        zIndex: 4,
        backgroundColor: '#222', // Fallback
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },
    inactiveDot: {
        width: 0,
        height: 0,
    },
    pulseRing: {
        position: 'absolute',
        top: -4, // Adjustment
        width: 32,
        height: 32,
        borderRadius: 16,
        zIndex: 0,
    },
    textContainer: {
        alignItems: 'center',
    },
    label: {
        fontSize: 11, // Reduced slightly
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        fontSize: 10, // Reduced slightly
        fontWeight: '500',
    },
    relativeTime: {
        fontSize: 9, // Reduced slightly
        fontWeight: '700',
        marginTop: 2,
    }
});

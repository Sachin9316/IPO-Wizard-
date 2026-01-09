import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import moment from 'moment';

interface IPOTimelineProps {
    item: IPOData;
}

const HorizontalStep = ({ label, date, status, colors, isFirst, isLast }: any) => {
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
        <View style={styles.hStep}>
            <View style={[styles.hStepCircle, { backgroundColor: isActive || isCompleted ? colors.primary : colors.text, opacity: isActive || isCompleted ? 1 : 0.2 }]} />
            {!isLast && (
                <View style={[styles.hStepLine, { backgroundColor: isActive || isCompleted ? colors.primary : colors.text, opacity: isActive || isCompleted ? 0.8 : 0.2, left: '50%', width: '100%' }]} />
            )}
            <Text style={[styles.hLabel, { color: colors.text, opacity: status === 'future' ? 0.5 : 1 }]}>{label}</Text>
            <Text style={[styles.hDate, { color: colors.text }]}>{date}</Text>
        </View>
    );
}

export const IPOTimeline = ({ item }: IPOTimelineProps) => {
    const { colors } = useTheme();

    const getStepStatus = (rawDateStr: string | undefined) => {
        if (!rawDateStr) return 'future';
        const now = moment().startOf('day');
        const targetDate = moment(rawDateStr).startOf('day');

        if (now.isSame(targetDate, 'day')) return 'active';
        if (now.isAfter(targetDate, 'day')) return 'completed';
        return 'future';
    };

    return (
        <View style={styles.sectionCompact}>
            <Text style={[styles.sectionTitleCompact, { color: colors.text }]}>Timeline</Text>
            <View style={styles.horizontalTimeline}>
                <HorizontalStep label="Open" date={moment(item.rawDates?.offerStart).format('DD MMM')} status={getStepStatus(item.rawDates?.offerStart)} colors={colors} isFirst />
                <HorizontalStep label="Close" date={moment(item.rawDates?.offerEnd).format('DD MMM')} status={getStepStatus(item.rawDates?.offerEnd)} colors={colors} />
                <HorizontalStep label="Allotment" date={moment(item.rawDates?.allotment).format('DD MMM')} status={getStepStatus(item.rawDates?.allotment)} colors={colors} />
                <HorizontalStep label="Listing" date={moment(item.rawDates?.listing).format('DD MMM')} status={getStepStatus(item.rawDates?.listing)} colors={colors} isLast />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionCompact: {
        padding: 16,
    },
    sectionTitleCompact: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },
    horizontalTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hStep: {
        alignItems: 'center',
        flex: 1,
    },
    hStepCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 4,
    },
    hStepLine: {
        position: 'absolute',
        top: 4,
        left: '50%',
        width: '100%',
        height: 2,
        zIndex: -1,
    },
    hLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 2
    },
    hDate: {
        fontSize: 9,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.6
    },
});

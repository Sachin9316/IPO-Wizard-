import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SubscriptionPieChartProps {
    details: any;
}

export const SubscriptionPieChart = ({ details }: SubscriptionPieChartProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Demand Distribution</Text>
            <PieChart
                data={[
                    { name: 'QIB', population: details.qib, color: '#2196F3', legendFontColor: colors.text, legendFontSize: 12 },
                    { name: 'Retail', population: details.retail, color: '#4CAF50', legendFontColor: colors.text, legendFontSize: 12 },
                    { name: 'sNII', population: details.snii || 0, color: '#FF9800', legendFontColor: colors.text, legendFontSize: 12 },
                    { name: 'bNII', population: details.bnii || 0, color: '#FF5722', legendFontColor: colors.text, legendFontSize: 12 },
                    ...(details.employee ? [{ name: 'Emp.', population: details.employee, color: '#9C27B0', legendFontColor: colors.text, legendFontSize: 12 }] : []),
                ]}
                width={SCREEN_WIDTH - 60}
                height={200}
                chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
            />
        </View>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

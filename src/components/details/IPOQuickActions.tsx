import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';
import { useNavigation } from '@react-navigation/native';

interface IPOQuickActionsProps {
    item: IPOData;
    onOpenPdf: (url: string, title: string) => void;
    onShowAlert: (props: any) => void;
}

const ActionIconButton = ({ icon, label, backgroundColor, borderColor, onPress }: any) => (
    <TouchableOpacity style={styles.actionIconButton} onPress={onPress}>
        <View style={[
            styles.iconCircle,
            {
                backgroundColor: backgroundColor,
                borderWidth: borderColor ? 1 : 0,
                borderColor: borderColor || 'transparent',
            }
        ]}>
            {icon}
        </View>
        <Text style={[styles.actionLabel, { color: '#666' }]}>{label}</Text>
    </TouchableOpacity>
);

export const IPOQuickActions = ({ item, onOpenPdf, onShowAlert }: IPOQuickActionsProps) => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <View style={styles.sectionCompact}>
            <Text style={[styles.sectionTitleCompact, { color: colors.text, marginBottom: 12 }]}>Quick Actions</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.actionsRow}
            >
                {/* Essential Documents */}
                {item.rhpUrl && (
                    <ActionIconButton
                        icon={<FileText size={24} color={colors.primary} />}
                        label="RHP PDF"
                        backgroundColor={colors.card}
                        borderColor={colors.border}
                        onPress={() => onOpenPdf(item.rhpUrl!, 'RHP Document')}
                    />
                )}
                {item.drhpUrl && (
                    <ActionIconButton
                        icon={<FileText size={24} color={colors.text} />}
                        label="DRHP PDF"
                        backgroundColor={colors.card}
                        borderColor={colors.border}
                        onPress={() => onOpenPdf(item.drhpUrl!, 'DRHP Document')}
                    />
                )}

                {/* Live Subscription */}
                <ActionIconButton
                    icon={<TrendingUp size={24} color="#4CAF50" />}
                    label="Live Subs"
                    backgroundColor={colors.card}
                    borderColor={colors.border}
                    onPress={() => {
                        if (item.subscriptionDetails) {
                            navigation.navigate('SubscriptionStatus', { ipo: item });
                        } else {
                            onShowAlert({ title: 'Info', message: 'Subscription data not available yet', type: 'info' });
                        }
                    }}
                />

                {/* GMP Trend */}
                <ActionIconButton
                    icon={<TrendingUp size={24} color="#FF9800" />}
                    label="GMP Trend"
                    backgroundColor={colors.card}
                    borderColor={colors.border}
                    onPress={() => {
                        if (item.gmpDetails && item.gmpDetails.length > 0) {
                            navigation.navigate('GMPStatus', { ipo: item });
                        } else {
                            onShowAlert({ title: 'Info', message: 'GMP data not available yet', type: 'info' });
                        }
                    }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionCompact: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionTitleCompact: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
        paddingRight: 16,
    },
    actionIconButton: {
        alignItems: 'center',
        gap: 6,
        width: 65,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});

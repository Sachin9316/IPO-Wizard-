import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { X, TrendingUp, Users, Briefcase, UserCheck } from 'lucide-react-native';

export const SubscriptionScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { subscriptionDetails, name } = route.params;

    if (!subscriptionDetails) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Subscription Status</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContent}>
                    <Text style={{ color: colors.text }}>No subscription data available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const total = subscriptionDetails.total;
    const maxVal = Math.max(subscriptionDetails.qib, subscriptionDetails.nii, subscriptionDetails.retail, subscriptionDetails.employee, total);

    const calculateChance = (value: number) => {
        if (value <= 1) return "Certain Allotment";
        if (value > 1) return `1 out of ${Math.round(value)}`;
        return "N/A";
    };

    const ProgressBar = ({ value, color }: { value: number, color: string }) => {
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

    const SubscriptionCard = ({ label, value, icon, color, description }: any) => {
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
                    <ProgressBar value={value} color={color} />
                    <View style={[styles.chanceBadge, { backgroundColor: `${color}15`, marginTop: 8 }]}>
                        <Text style={[styles.chanceText, { color: color }]}>
                            Chance: {chance}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Live Subscription</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.companyName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>Real-time Subscription Status</Text>
                </View>

                {/* Hero Card for Total */}
                <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                    <View>
                        <Text style={styles.heroLabel}>Total Subscription</Text>
                        <Text style={styles.heroValue}>{total}x</Text>
                        <Text style={styles.heroSub}>Overall demand for this IPO</Text>
                    </View>
                    <View style={styles.heroIcon}>
                        <TrendingUp size={40} color="#FFF" />
                    </View>
                </View>

                <View style={styles.grid}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="QIB"
                                value={subscriptionDetails.qib}
                                icon={<Briefcase size={20} color="#2196F3" />}
                                color="#2196F3"
                                description="Qualified Inst."
                            />
                        </View>
                        <View style={{ width: 16 }} />
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="NII"
                                value={subscriptionDetails.nii}
                                icon={<Users size={20} color="#FF9800" />}
                                color="#FF9800"
                                description="Non-Institutional"
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="Retail"
                                value={subscriptionDetails.retail}
                                icon={<UserCheck size={20} color="#4CAF50" />}
                                color="#4CAF50"
                                description="Retail Inv."
                            />
                        </View>
                        <View style={{ width: 16 }} />
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="Employee"
                                value={subscriptionDetails.employee}
                                icon={<Users size={20} color="#9C27B0" />}
                                color="#9C27B0"
                                description="Employee Quota"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    closeBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    heroCard: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    heroValue: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    heroIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        gap: 16,
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
    },
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

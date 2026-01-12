import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ArrowLeft, Users, Briefcase, UserCheck } from 'lucide-react-native';
import { SubscriptionCard } from '../../components/subscription/SubscriptionCard';
import { SubscriptionHero } from '../../components/subscription/SubscriptionHero';
import { SubscriptionPieChart } from '../../components/subscription/SubscriptionPieChart';
import { IPOHero } from '../../components/details/IPOHero';

export const SubscriptionScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { ipo } = route.params;
    const subscriptionDetails = ipo?.subscriptionDetails;
    const name = ipo?.name;

    if (!subscriptionDetails) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <ArrowLeft color={colors.text} size={24} />
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Live Subscription</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Hero Card for Total */}
                <IPOHero item={ipo} style={{ paddingHorizontal: 0, paddingVertical: 0, marginBottom: 12 }} />

                {/* Hero Card for Total */}
                <SubscriptionHero total={total} />

                {/* Pie Chart for Distribution */}
                <SubscriptionPieChart details={subscriptionDetails} />

                <View style={styles.grid}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="QIB"
                                value={subscriptionDetails.qib}
                                maxVal={maxVal}
                                icon={<Briefcase size={20} color="#2196F3" />}
                                color="#2196F3"
                                description="Qualified Inst."
                            />
                        </View>
                        <View style={{ width: 16 }} />
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="Retail"
                                value={subscriptionDetails.retail}
                                maxVal={maxVal}
                                icon={<UserCheck size={20} color="#4CAF50" />}
                                color="#4CAF50"
                                description="Retail Inv."
                            />
                        </View>
                    </View>

                    {ipo?.type !== 'SME' && (
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <SubscriptionCard
                                    label="sNII"
                                    value={subscriptionDetails.snii || 0}
                                    maxVal={maxVal}
                                    icon={<Users size={20} color="#FF9800" />}
                                    color="#FF9800"
                                    description="Small NII (2-10L)"
                                />
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={{ flex: 1 }}>
                                <SubscriptionCard
                                    label="bNII"
                                    value={subscriptionDetails.bnii || 0}
                                    maxVal={maxVal}
                                    icon={<Users size={20} color="#FF5722" />}
                                    color="#FF5722"
                                    description="Big NII (>10L)"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <SubscriptionCard
                                label="NII (Total)"
                                value={subscriptionDetails.nii}
                                maxVal={maxVal}
                                icon={<Users size={20} color="#FFC107" />}
                                color="#FFC107"
                                description="Non-Institutional"
                            />
                        </View>
                        <View style={{ width: 16 }} />
                        <View style={{ flex: 1 }}>
                            {subscriptionDetails.employee > 0 ? (
                                <SubscriptionCard
                                    label="Employee"
                                    value={subscriptionDetails.employee}
                                    maxVal={maxVal}
                                    icon={<Users size={20} color="#9C27B0" />}
                                    color="#9C27B0"
                                    description="Employee Quota"
                                />
                            ) : (
                                <View style={{ flex: 1 }} />
                            )}
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
    grid: {
        gap: 16,
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
    },
});

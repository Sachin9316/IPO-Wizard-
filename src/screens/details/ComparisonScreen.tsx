import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ArrowLeft, TrendingUp, Calendar, CircleDollarSign } from 'lucide-react-native';
import { IPOData } from '../../types/ipo';

export const ComparisonScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { ipo1, ipo2 } = route.params;

    const CompareRow = ({ label, val1, val2, isDate = false }: { label: string, val1: any, val2: any, isDate?: boolean }) => (
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.labelCol}>
                <Text style={[styles.labelText, { color: colors.text, opacity: 0.6 }]}>{label}</Text>
            </View>
            <View style={styles.valCol}>
                <Text style={[styles.valText, { color: colors.text }]}>{val1}</Text>
            </View>
            <View style={styles.valCol}>
                <Text style={[styles.valText, { color: colors.text }]}>{val2}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Compare IPOs</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Visual Header */}
                <View style={[styles.row, { borderBottomWidth: 0, marginBottom: 20 }]}>
                    <View style={styles.labelCol} />
                    <View style={styles.valCol}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {ipo1.logoUrl ? <Image source={{ uri: ipo1.logoUrl }} style={styles.logo} resizeMode="contain" /> : <Text style={{ fontSize: 8, color: colors.text }}>LOGO</Text>}
                        </View>
                        <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={2}>{ipo1.name}</Text>
                    </View>
                    <View style={styles.valCol}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {ipo2.logoUrl ? <Image source={{ uri: ipo2.logoUrl }} style={styles.logo} resizeMode="contain" /> : <Text style={{ fontSize: 8, color: colors.text }}>LOGO</Text>}
                        </View>
                        <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={2}>{ipo2.name}</Text>
                    </View>
                </View>

                <View style={[styles.sectionHeader, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Offer Details</Text>
                </View>

                <CompareRow label="Type" val1={ipo1.type} val2={ipo2.type} />
                <CompareRow label="Price Range" val1={ipo1.priceRange} val2={ipo2.priceRange} />
                <CompareRow label="Lot Size" val1={ipo1.lotSize} val2={ipo2.lotSize} />
                <CompareRow label="Issue Size" val1={ipo1.issueSize} val2={ipo2.issueSize} />
                <CompareRow label="GMP" val1={ipo1.gmp} val2={ipo2.gmp} />

                <View style={[styles.sectionHeader, { backgroundColor: colors.card, marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Offer Timelines</Text>
                </View>

                <CompareRow label="Offer Start" val1={ipo1.dates.offerStart} val2={ipo2.dates.offerStart} />
                <CompareRow label="Offer End" val1={ipo1.dates.offerEnd} val2={ipo2.dates.offerEnd} />
                <CompareRow label="Allotment" val1={ipo1.dates.allotment} val2={ipo2.dates.allotment} />
                <CompareRow label="Listing" val1={ipo1.dates.listing} val2={ipo2.dates.listing} />

                <View style={[styles.sectionHeader, { backgroundColor: colors.card, marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Other Info</Text>
                </View>
                <CompareRow label="Status" val1={ipo1.status} val2={ipo2.status} />
                <CompareRow label="Registrar" val1={ipo1.registrarName || 'N/A'} val2={ipo2.registrarName || 'N/A'} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    closeBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { paddingBottom: 40 },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    labelCol: { flex: 1.2, paddingRight: 8 },
    valCol: { flex: 1, alignItems: 'center' },
    labelText: { fontSize: 12, fontWeight: '600' },
    valText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    logo: { width: '80%', height: '80%' },
    companyName: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', height: 40 },
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});

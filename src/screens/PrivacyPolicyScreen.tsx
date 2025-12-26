import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.text, { color: colors.text, marginBottom: 20 }]}>
                    Last Updated: December 2025
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Disclaimer</Text>
                <Text style={[styles.text, { color: colors.text }]}>
                    IPO Wizard is an informational platform providing details about Initial Public Offerings (IPOs) in India. We do NOT provide financial advice, investment recommendations, or stock tips. User discretion is advised before making any investment decisions. Investments in securities market are subject to market risks, read all the related documents carefully before investing.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Information We Collect</Text>
                <Text style={[styles.text, { color: colors.text }]}>
                    To provide you with the best experience, we may collect the following information:
                    {"\n\n"}• <Text style={{ fontWeight: 'bold' }}>Personal Information:</Text> When you sign up, we verify your email address to create your profile and sync your watchlist/portfolio across devices.
                    {"\n"}• <Text style={{ fontWeight: 'bold' }}>Usage Data:</Text> Information about how you interact with the app, such as IPOs viewed and features used, to help us improve our services.
                    {"\n"}• <Text style={{ fontWeight: 'bold' }}>Device Information:</Text> Standard device identifiers to optimize app performance and notification delivery.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Use of Information</Text>
                <Text style={[styles.text, { color: colors.text }]}>
                    We use the collected data to:
                    {"\n\n"}• Provide and maintain our Service.
                    {"\n"}• Notify you about changes to our Service.
                    {"\n"}• Provide customer support.
                    {"\n"}• Monitor the usage of the Service.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Third Party Data & Links</Text>
                <Text style={[styles.text, { color: colors.text }]}>
                    Our app displays data aggregated from various public sources, including stock exchanges (NSE/BSE) and company filings (RHP/DRHP). We strive for accuracy but do not guarantee it. The app may contain links to third-party websites (e.g., Registrar's website). We have no control over and assume no responsibility for the content or privacy policies of any third-party sites or services.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Data Security</Text>
                <Text style={[styles.text, { color: colors.text }]}>
                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your Personal Data.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Contact Us</Text>
                <Text style={[styles.text, { color: colors.text, marginBottom: 40 }]}>
                    If you have any questions about this Privacy Policy, please contact us at support@ipowizard.com.
                </Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
    },
});

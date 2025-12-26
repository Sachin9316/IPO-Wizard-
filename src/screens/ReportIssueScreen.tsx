import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Clipboard, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Copy } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const ReportIssueScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const email = 'sachinu829@gmail.com';

    const handleEmailPress = () => {
        Linking.openURL(`mailto:${email}`);
    };

    const handleCopyPress = () => {
        Clipboard.setString(email);
        Alert.alert("Copied", "Email address copied to clipboard.");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Report an Issue</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Mail size={48} color={colors.primary} style={styles.icon} />
                    <Text style={[styles.description, { color: colors.text }]}>
                        If you are facing any issues or have queries regarding the allotment status, please contact us at:
                    </Text>

                    <TouchableOpacity onPress={handleEmailPress} style={[styles.emailContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCopyPress} style={styles.copyButton}>
                        <Copy size={16} color={colors.text} style={{ opacity: 0.6 }} />
                        <Text style={[styles.copyText, { color: colors.text }]}>Copy Email</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        elevation: 2,
    },
    icon: { marginBottom: 20 },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
        lineHeight: 24,
    },
    emailContainer: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    emailText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    copyText: {
        fontSize: 14,
        opacity: 0.6,
    },
});

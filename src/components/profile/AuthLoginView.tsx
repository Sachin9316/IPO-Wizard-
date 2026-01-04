import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Loader, ShieldCheck, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';

interface AuthLoginViewProps {
    email: string;
    setEmail: (text: string) => void;
    handleLogin: () => void;
    loginLoading: boolean;
    verificationStep: boolean;
    setVerificationStep: (step: boolean) => void;
}

export const AuthLoginView = ({
    email,
    setEmail,
    handleLogin,
    loginLoading,
    verificationStep,
    setVerificationStep
}: AuthLoginViewProps) => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.authContainer}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Mail size={48} color={colors.primary} />
                    </View>

                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to IPO Wizard</Text>

                    {!verificationStep ? (
                        <>
                            <Text style={[styles.welcomeSubtitle, { color: colors.text, opacity: 0.6 }]}>
                                Enter your email to login or register. No password required.
                            </Text>

                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                                placeholder="name@example.com"
                                placeholderTextColor={colors.text + '60'}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleLogin}
                                disabled={loginLoading}
                            >
                                {loginLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.verificationContainer}>
                            <Loader size={40} color={colors.primary} style={styles.spinner} />
                            <Text style={[styles.verificationTitle, { color: colors.text }]}>Check your Email</Text>
                            <Text style={[styles.verificationText, { color: colors.text, opacity: 0.7 }]}>
                                We sent a verification link to {email}. Tap the link in your email to login automatically.
                            </Text>
                            <TouchableOpacity
                                style={styles.cancelLink}
                                onPress={() => setVerificationStep(false)}
                            >
                                <Text style={{ color: colors.primary }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Footer Links for Unauthenticated Users */}
                    <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                            <Text style={[styles.footerLinkText, { color: colors.text }]}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={[styles.footerDivider, { color: colors.text }]}>•</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Licenses')}>
                            <Text style={[styles.footerLinkText, { color: colors.text }]}>Licenses</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    authContainer: { flex: 1, justifyContent: 'center', padding: 30, alignItems: 'center', paddingBottom: 100 },
    logoContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    welcomeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 20 },
    loginButton: { width: '100%', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    verificationContainer: { alignItems: 'center', width: '100%' },
    spinner: { marginBottom: 20 },
    verificationTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    verificationText: { textAlign: 'center', fontSize: 15, marginBottom: 24, lineHeight: 22 },
    cancelLink: { padding: 10 },
    footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40, opacity: 0.6 },
    footerLinkText: { fontSize: 13, textDecorationLine: 'underline' },
    footerDivider: { marginHorizontal: 10, fontSize: 13 },
});

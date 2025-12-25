import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { User, Mail, LogOut, Loader, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen = () => {
    const { colors } = useTheme();
    const { user, isAuthenticated, startLogin, pollLoginStatus, logout } = useAuth();

    // Auth State
    const [email, setEmail] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false); // true if polling
    const [loginId, setLoginId] = useState<string | null>(null);

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (verificationStep && loginId) {
            interval = setInterval(async () => {
                const success = await pollLoginStatus(loginId);
                if (success) {
                    setVerificationStep(false);
                    setLoginId(null);
                    setLoginLoading(false);
                    // AuthContext updates isAuthenticated, triggering UI change
                }
            }, 3000); // Poll every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [verificationStep, loginId]);

    const handleLogin = async () => {
        if (!email.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        setLoginLoading(true);
        try {
            const id = await startLogin(email);
            setLoginId(id);
            setVerificationStep(true);
            setLoginLoading(false);
        } catch (error: any) {
            Alert.alert("Error", error.message);
            setLoginLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
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
                                    <TouchableOpacity onPress={() => setVerificationStep(false)} style={styles.cancelLink}>
                                        <Text style={{ color: colors.primary }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{user?.name}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text, opacity: 0.5 }]}>
                        {user?.email}
                    </Text>
                    <View style={[styles.verifiedBadge, { backgroundColor: '#4CAF5015' }]}>
                        <CheckCircle size={14} color="#4CAF50" />
                        <Text style={[styles.verifiedText, { color: '#4CAF50' }]}>Verified Account</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardRow}>
                        <User size={20} color={colors.primary} />
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: colors.text, opacity: 0.6 }]}>Full Name</Text>
                            <Text style={[styles.cardValue, { color: colors.text }]}>{user?.name}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.cardRow}>
                        <Mail size={20} color={colors.primary} />
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: colors.text, opacity: 0.6 }]}>Email Address</Text>
                            <Text style={[styles.cardValue, { color: colors.text }]}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { borderColor: '#F44336' }]}
                    onPress={logout}
                >
                    <LogOut size={20} color="#F44336" />
                    <Text style={[styles.logoutText, { color: '#F44336' }]}>Logout</Text>
                </TouchableOpacity>

                <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.infoText, { color: colors.primary }]}>
                        Everything is synced with your account.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    // Auth Styles
    authContainer: { flex: 1, justifyContent: 'center', padding: 30, alignItems: 'center' },
    logoContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    welcomeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 20 },
    loginButton: { width: '100%', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    verificationContainer: { alignItems: 'center', width: '100%' },
    spinner: { marginBottom: 20 }, // Note: Lucide does not animate automatically, ActivityIndicator usually better but Loader icon works for static
    verificationTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    verificationText: { textAlign: 'center', fontSize: 15, marginBottom: 24, lineHeight: 22 },
    cancelLink: { padding: 10 },

    // Profile Styles
    header: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 4 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    headerSubtitle: { fontSize: 14 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, gap: 4 },
    verifiedText: { fontSize: 12, fontWeight: '600' },
    card: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    cardTextContainer: { flex: 1 },
    cardLabel: { fontSize: 12, textTransform: 'uppercase', marginBottom: 4, fontWeight: '600' },
    cardValue: { fontSize: 16, fontWeight: '500' },
    divider: { height: 1, marginVertical: 16, opacity: 0.5 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1.5, gap: 8, marginBottom: 24 },
    logoutText: { fontSize: 16, fontWeight: '600' },
    infoBanner: { borderRadius: 12, padding: 16, alignItems: 'center' },
    infoText: { fontSize: 14, fontWeight: '500' },
});

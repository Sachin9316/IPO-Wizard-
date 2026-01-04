import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useUI } from '../context/UIContext';
import { AuthLoginView } from '../components/profile/AuthLoginView';
import { UserProfileView } from '../components/profile/UserProfileView';

export const ProfileScreen = () => {
    const { colors, theme, toggleTheme } = useTheme();
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, startLogin, pollLoginStatus, logout } = useAuth();
    const { showAlert } = useUI();

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
            showAlert({
                title: "Invalid Email",
                message: "Please enter a valid email address.",
                type: 'warning'
            });
            return;
        }
        setLoginLoading(true);
        try {
            const id = await startLogin(email);
            setLoginId(id);
            setVerificationStep(true);
            setLoginLoading(false);
        } catch (error: any) {
            showAlert({
                title: "Login Error",
                message: error.message,
                type: 'error'
            });
            setLoginLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <AuthLoginView
                    email={email}
                    setEmail={setEmail}
                    handleLogin={handleLogin}
                    loginLoading={loginLoading}
                    verificationStep={verificationStep}
                    setVerificationStep={setVerificationStep}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <UserProfileView
                user={user}
                theme={theme}
                toggleTheme={toggleTheme}
                logout={logout}
                navigation={navigation}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

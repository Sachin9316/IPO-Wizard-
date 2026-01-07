import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { User, Mail, LogOut, CheckCircle, ShieldCheck, FileText, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useUI } from '../../context/UIContext';
import { usePreferences } from '../../context/PreferencesContext';

interface UserProfileViewProps {
    user: any;
    theme: string;
    toggleTheme: () => void;
    logout: () => void;
    navigation: any;
}

export const UserProfileView = ({
    user,
    theme,
    toggleTheme,
    logout,
    navigation
}: UserProfileViewProps) => {
    const { colors } = useTheme();
    const { showAlert } = useUI();
    const { isPanMasked, togglePanMask } = usePreferences();

    const handleLogout = () => {
        showAlert({
            title: "Logout",
            message: "Are you sure you want to logout? Your local PANs will remain on this device.",
            type: 'warning',
            buttons: [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: logout
                }
            ]
        });
    };

    return (
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

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

            <View style={[styles.menuButton, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {theme === 'dark' ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
                    <Text style={[styles.menuButtonText, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
                />
            </View>

            <View style={[styles.menuButton, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <ShieldCheck size={20} color={colors.primary} />
                    <Text style={[styles.menuButtonText, { color: colors.text }]}>Mask PAN</Text>
                </View>
                <Switch
                    value={isPanMasked}
                    onValueChange={togglePanMask}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={isPanMasked ? colors.primary : '#f4f3f4'}
                />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Support & Legal</Text>

            <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('PrivacyPolicy')}
            >
                <ShieldCheck size={20} color={colors.primary} />
                <Text style={[styles.menuButtonText, { color: colors.text }]}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Licenses')}
            >
                <FileText size={20} color={colors.primary} />
                <Text style={[styles.menuButtonText, { color: colors.text }]}>Licenses</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.logoutButton, { borderColor: '#F44336' }]}
                onPress={handleLogout}
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
    );
};

const styles = StyleSheet.create({
    content: { padding: 20 },
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
    menuButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 16, marginBottom: 16 },
    menuButtonText: { fontSize: 16, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, marginTop: 8, opacity: 0.8 },
    infoBanner: { borderRadius: 12, padding: 16, alignItems: 'center' },
    infoText: { fontSize: 14, fontWeight: '500' },
});

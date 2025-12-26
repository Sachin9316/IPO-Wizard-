import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, ExternalLink, Github } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const LicensesScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const libraries = [
        { name: 'React Native', license: 'MIT' },
        { name: 'React Navigation', license: 'MIT' },
        { name: 'Lucide React Native', license: 'ISC' },
        { name: 'Axios', license: 'MIT' },
        { name: 'Date-fns', license: 'MIT' },
        { name: 'Async Storage', license: 'MIT' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Open Source Licenses</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.introText, { color: colors.text }]}>
                    This application uses the following open source software:
                </Text>
                {libraries.map((lib, index) => (
                    <View key={index} style={[styles.licenseItem, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.libName, { color: colors.text }]}>{lib.name}</Text>
                        <Text style={[styles.libLicense, { color: colors.text, opacity: 0.6 }]}>{lib.license}</Text>
                    </View>
                ))}
            </ScrollView>
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
    content: { padding: 20 },
    introText: { fontSize: 16, marginBottom: 20 },
    licenseItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    libName: { fontSize: 16, fontWeight: '600' },
    libLicense: { fontSize: 14 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, AlertTriangle, FileText, CheckCircle2, Mail } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUI } from '../context/UIContext';

const ISSUES = [
    "Declared Allotted but showing Not Allotted",
    "Missing allotments from search results",
    "Incorrect number of shares/lots shown",
    "PAN/Account name mismatch",
    "Technical error during check",
    "Other"
];

export const ReportIssueScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { showAlert } = useUI();
    const params = (route.params as any) || {};
    const { ipoName, userName, panNumber, allotmentStatus } = params;

    const [selectedIssue, setSelectedIssue] = useState(ISSUES[0]);
    const [message, setMessage] = useState('');
    const [isEdited, setIsEdited] = useState(false);
    const supportEmail = 'sachinu829@gmail.com';

    useEffect(() => {
        // If the user hasn't manually edited the message, update it when issue/params change
        if (!isEdited) {
            const template = `Hello Support Team,

I am reporting an issue regarding my IPO allotment status.

Details:
- IPO Name: ${ipoName || 'N/A'}
- User Name: ${userName || 'N/A'}
- PAN Number: ${panNumber || 'N/A'}
- Current Allotment Status In App: ${allotmentStatus || 'N/A'}

Issue: ${selectedIssue}

Additional Details:
[Please add any other relevant information here]

Thank you.`;
            setMessage(template);
        }
    }, [ipoName, userName, panNumber, allotmentStatus, selectedIssue, isEdited]);

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`[Issue] Allotment Status: ${ipoName || 'General'}`);
        const body = encodeURIComponent(message);
        const mailtoUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

        Linking.canOpenURL(mailtoUrl).then(supported => {
            if (supported) {
                Linking.openURL(mailtoUrl);
            } else {
                showAlert({
                    title: "Error",
                    message: "Could not open email app. Please copy the email address manually.",
                    type: 'error'
                });
            }
        });
    };

    const handleMessageChange = (text: string) => {
        setMessage(text);
        setIsEdited(true); // Mark as edited so template doesn't overwrite it
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Report an Issue</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>What is the issue?</Text>
                <View style={styles.issuesList}>
                    {ISSUES.map((issue) => (
                        <TouchableOpacity
                            key={issue}
                            onPress={() => setSelectedIssue(issue)}
                            style={[
                                styles.issueItem,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: selectedIssue === issue ? colors.primary : colors.border
                                }
                            ]}
                        >
                            <Text style={[
                                styles.issueText,
                                {
                                    color: colors.text,
                                    fontWeight: selectedIssue === issue ? '600' : '400'
                                }
                            ]}>
                                {issue}
                            </Text>
                            {selectedIssue === issue && (
                                <CheckCircle2 size={16} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Message Template</Text>
                <TextInput
                    style={[
                        styles.textInput,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text
                        }
                    ]}
                    multiline
                    numberOfLines={10}
                    value={message}
                    onChangeText={handleMessageChange}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    onPress={handleSendEmail}
                    style={[styles.sendButton, { backgroundColor: colors.primary }]}
                >
                    <Send size={18} color="#FFF" />
                    <Text style={styles.sendButtonText}>Send via Email</Text>
                </TouchableOpacity>

                <View style={[styles.infoBox, { backgroundColor: colors.card + '80' }]}>
                    <Mail size={16} color={colors.text} opacity={0.6} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        Sent to: {supportEmail}
                    </Text>
                </View>

                <Text style={[styles.footerText, { color: colors.text }]}>
                    Your name and PAN details are automatically included in the template to help us resolve the issue faster.
                </Text>
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
    backButton: { padding: 4 },
    title: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    issuesList: {
        gap: 8,
    },
    issueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    issueText: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    textInput: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        fontSize: 14,
        minHeight: 200,
        marginBottom: 24,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 13,
        opacity: 0.6,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 18,
        marginBottom: 20,
    }
});

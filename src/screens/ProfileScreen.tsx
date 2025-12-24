import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { User, Phone, Edit, Check, X } from 'lucide-react-native';

export const ProfileScreen = () => {
    const { colors } = useTheme();
    const [name, setName] = useState('Rajesh Kumar');
    const [mobileNumber, setMobileNumber] = useState('9876543210');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingMobile, setIsEditingMobile] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempMobile, setTempMobile] = useState('');
    const [errors, setErrors] = useState({ name: '', mobile: '' });

    const validateMobile = (number: string) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(number);
    };

    const handleEditName = () => {
        setTempName(name);
        setIsEditingName(true);
        setErrors({ ...errors, name: '' });
    };

    const handleSaveName = () => {
        if (!tempName.trim()) {
            setErrors({ ...errors, name: 'Name is required' });
            return;
        }
        setName(tempName);
        setIsEditingName(false);
        setErrors({ ...errors, name: '' });
    };

    const handleCancelName = () => {
        setIsEditingName(false);
        setTempName('');
        setErrors({ ...errors, name: '' });
    };

    const handleEditMobile = () => {
        setTempMobile(mobileNumber);
        setIsEditingMobile(true);
        setErrors({ ...errors, mobile: '' });
    };

    const handleSaveMobile = () => {
        if (!tempMobile.trim()) {
            setErrors({ ...errors, mobile: 'Mobile number is required' });
            return;
        }
        if (!validateMobile(tempMobile)) {
            setErrors({ ...errors, mobile: 'Invalid mobile number (10 digits, starting with 6-9)' });
            return;
        }
        setMobileNumber(tempMobile);
        setIsEditingMobile(false);
        setErrors({ ...errors, mobile: '' });
    };

    const handleCancelMobile = () => {
        setIsEditingMobile(false);
        setTempMobile('');
        setErrors({ ...errors, mobile: '' });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Modern Header with Gradient Avatar */}
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <User size={36} color="#fff" />
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text, opacity: 0.5 }]}>
                        Manage your details
                    </Text>
                </View>

                {/* Name Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.labelContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                                <User size={16} color={colors.primary} />
                            </View>
                            <Text style={[styles.cardLabel, { color: colors.text, opacity: 0.6 }]}>
                                Full Name
                            </Text>
                        </View>
                        {!isEditingName && (
                            <TouchableOpacity onPress={handleEditName} style={styles.editBtn}>
                                <Edit size={18} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditingName ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        borderColor: errors.name ? '#F44336' : colors.border,
                                    },
                                ]}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.text + '60'}
                                value={tempName}
                                onChangeText={(text) => {
                                    setTempName(text);
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                autoFocus
                            />
                            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                    onPress={handleSaveName}
                                >
                                    <Check size={16} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { borderColor: colors.border }]}
                                    onPress={handleCancelName}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.displayValue, { color: colors.text }]}>
                            {name}
                        </Text>
                    )}
                </View>

                {/* Mobile Number Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.labelContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                                <Phone size={16} color={colors.primary} />
                            </View>
                            <Text style={[styles.cardLabel, { color: colors.text, opacity: 0.6 }]}>
                                Mobile Number
                            </Text>
                        </View>
                        {!isEditingMobile && (
                            <TouchableOpacity onPress={handleEditMobile} style={styles.editBtn}>
                                <Edit size={18} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditingMobile ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        borderColor: errors.mobile ? '#F44336' : colors.border,
                                    },
                                ]}
                                placeholder="Enter mobile number"
                                placeholderTextColor={colors.text + '60'}
                                value={tempMobile}
                                onChangeText={(text) => {
                                    setTempMobile(text);
                                    if (errors.mobile) setErrors({ ...errors, mobile: '' });
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                                autoFocus
                            />
                            {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                    onPress={handleSaveMobile}
                                >
                                    <Check size={16} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { borderColor: colors.border }]}
                                    onPress={handleCancelMobile}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.mobileNumber, { color: colors.text }]}>
                            +91 {mobileNumber}
                        </Text>
                    )}
                </View>

                {/* Info Banner */}
                <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.infoText, { color: colors.primary }]}>
                        💡 Your details are securely stored and used for IPO applications
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 12,
    },
    avatarContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    editBtn: {
        padding: 6,
    },
    displayValue: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 42,
    },
    mobileNumber: {
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: 1,
        marginLeft: 42,
    },
    editContainer: {
        gap: 14,
        marginLeft: 42,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: -10,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        gap: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoBanner: {
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
    },
});

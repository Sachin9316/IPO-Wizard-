import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { X } from 'lucide-react-native';

interface AddPANModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { panNumber: string; name?: string }) => void;
    requireName?: boolean;
    editData?: { panNumber: string; name?: string } | null;
}

export const AddPANModal = ({ visible, onClose, onSubmit, requireName = true, editData = null }: AddPANModalProps) => {
    const { colors } = useTheme();
    const [panNumber, setPanNumber] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({ panNumber: '', name: '' });

    // Update form when editData changes
    React.useEffect(() => {
        if (editData) {
            setPanNumber(editData.panNumber || '');
            setName(editData.name || '');
        } else {
            setPanNumber('');
            setName('');
        }
    }, [editData, visible]);

    const validatePAN = (pan: string) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    };

    const handleSubmit = () => {
        let hasError = false;
        const newErrors = { panNumber: '', name: '' };

        if (!panNumber.trim()) {
            newErrors.panNumber = 'PAN number is required';
            hasError = true;
        } else if (!validatePAN(panNumber)) {
            newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
            hasError = true;
        }

        if (requireName && !name.trim()) {
            newErrors.name = 'Name is required';
            hasError = true;
        }

        setErrors(newErrors);

        if (!hasError) {
            onSubmit({ panNumber: panNumber.toUpperCase(), name: name.trim() });
            setPanNumber('');
            setName('');
            setErrors({ panNumber: '', name: '' });
            onClose();
        }
    };

    const handleClose = () => {
        setPanNumber('');
        setName('');
        setErrors({ panNumber: '', name: '' });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {editData ? 'Edit' : 'Add'} {requireName ? 'Saved' : 'Unsaved'} PAN
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <X color={colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>PAN Number *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.card,
                                        color: colors.text,
                                        borderColor: errors.panNumber ? '#F44336' : colors.border
                                    }
                                ]}
                                placeholder="ABCDE1234F"
                                placeholderTextColor={colors.text + '60'}
                                value={panNumber}
                                onChangeText={(text) => {
                                    setPanNumber(text.toUpperCase());
                                    if (errors.panNumber) setErrors({ ...errors, panNumber: '' });
                                }}
                                maxLength={10}
                                autoCapitalize="characters"
                            />
                            {errors.panNumber ? (
                                <Text style={styles.errorText}>{errors.panNumber}</Text>
                            ) : null}
                        </View>

                        {requireName && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.card,
                                            color: colors.text,
                                            borderColor: errors.name ? '#F44336' : colors.border
                                        }
                                    ]}
                                    placeholder="Enter full name"
                                    placeholderTextColor={colors.text + '60'}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors({ ...errors, name: '' });
                                    }}
                                />
                                {errors.name ? (
                                    <Text style={styles.errorText}>{errors.name}</Text>
                                ) : null}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>{editData ? 'Update' : 'Add'} PAN</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

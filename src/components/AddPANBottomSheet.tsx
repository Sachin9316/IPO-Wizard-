import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { X, Check } from 'lucide-react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AddPANBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { panNumber: string; name?: string }) => void;
    requireName?: boolean;
    editData?: { panNumber: string; name?: string } | null;
}

export const AddPANBottomSheet = ({ visible, onClose, onSubmit, requireName = true, editData = null }: AddPANBottomSheetProps) => {
    const { colors } = useTheme();
    const [panNumber, setPanNumber] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({ panNumber: '', name: '' });

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Start off-screen
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset form
            if (editData) {
                setPanNumber(editData.panNumber || '');
                setName(editData.name || '');
            } else {
                setPanNumber('');
                setName('');
            }
            // Animate In
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 5,
                })
            ]).start();
        } else {
            // Animate Out (handled by internal close if triggered manually, but this catches prop changes)
            setErrors({ panNumber: '', name: '' });
        }
    }, [visible, editData]);

    const handleClose = () => {
        Keyboard.dismiss();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT, // Slide down completely
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            onClose();
        });
    };

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

        setErrors(newErrors);

        if (!hasError) {
            onSubmit({ panNumber: panNumber.toUpperCase(), name: name.trim() });
            handleClose();
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                {/* Sheet Content */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Reset to 0 to test native behavior with flex:1
                >
                    <Animated.View
                        style={[
                            styles.sheet,
                            {
                                backgroundColor: colors.card,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {editData ? 'Update PAN' : 'Add New PAN'}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                                <X size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>PAN NUMBER</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: editData ? colors.border + '30' : colors.background,
                                            color: editData ? colors.text + '80' : colors.text,
                                            borderColor: errors.panNumber ? '#F44336' : colors.border,
                                            opacity: editData ? 0.8 : 1
                                        }
                                    ]}
                                    placeholder="e.g. ABCDE1234F"
                                    placeholderTextColor={colors.text + '50'}
                                    value={panNumber}
                                    onChangeText={(txt) => {
                                        setPanNumber(txt.toUpperCase());
                                        if (errors.panNumber) setErrors(e => ({ ...e, panNumber: '' }));
                                    }}
                                    maxLength={10}
                                    autoCapitalize="characters"
                                    editable={!editData}
                                />
                                {errors.panNumber ? <Text style={styles.errorText}>{errors.panNumber}</Text> : null}
                            </View>

                            {requireName && (
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, { color: colors.text }]}>FULL NAME AS ON PAN (OPTIONAL)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                        placeholder="e.g. My Personal PAN"
                                        placeholderTextColor={colors.text + '50'}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                onPress={handleSubmit}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.submitText}>{editData ? 'Update PAN Details' : 'Save PAN Card'}</Text>
                            </TouchableOpacity>
                        </View>

                        <SafeAreaView edges={['bottom']} />
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    keyboardView: {
        flex: 1, // Ensure it takes full height to push up correctly
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 8,
        borderRadius: 20,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        color: '#F44336',
    },
    submitBtn: {
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

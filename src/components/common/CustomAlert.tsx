import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
    title: string;
    message: string;
    buttons?: AlertButton[];
    type?: 'info' | 'success' | 'warning' | 'error';
    variant?: 'centered' | 'bottom-sheet';
    style?: 'classic' | 'modern' | 'glass';
    onClose?: () => void;
}

export const CustomAlert: React.FC<AlertOptions & { onClose: () => void }> = ({
    title, message, buttons, type = 'info', variant = 'centered', style = 'modern', onClose
}) => {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const slideAnim = useRef(new Animated.Value(variant === 'bottom-sheet' ? 300 : 0)).current;

    useEffect(() => {
        const animations = [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            })
        ];

        if (variant === 'centered') {
            animations.push(
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: false,
                })
            );
        } else {
            animations.push(
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: false,
                })
            );
        }

        Animated.parallel(animations).start();
    }, [variant]);

    const getTypeIcon = () => {
        const size = 28;
        switch (type) {
            case 'success': return <CheckCircle2 size={size} color="#4CAF50" />;
            case 'error': return <XCircle size={size} color="#F44336" />;
            case 'warning': return <AlertCircle size={size} color="#FF9800" />;
            default: return <Info size={size} color={colors.primary} />;
        }
    };

    const handleBackdropPress = () => {
        // Only allow background dismissal if no buttons are provided
        if (!buttons || buttons.length === 0) {
            onClose();
        }
    };

    const handleButtonPress = (btn: AlertButton) => {
        onClose();
        if (btn.onPress) {
            btn.onPress();
        }
    };

    // If no buttons provided, add a default 'OK' button
    const finalButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];

    return (
        <Modal transparent animationType="none" visible={true} onRequestClose={onClose}>
            <TouchableOpacity
                activeOpacity={1}
                style={variant === 'centered' ? styles.backdrop : styles.backdropBottom}
                onPress={handleBackdropPress}
            >
                <Animated.View
                    style={[
                        variant === 'centered' ? styles.container : styles.bottomSheet,
                        {
                            backgroundColor: style === 'glass' ? colors.card + 'D0' : colors.card,
                            opacity: fadeAnim,
                            transform: [
                                variant === 'centered'
                                    ? { scale: scaleAnim }
                                    : { translateY: slideAnim }
                            ],
                            borderColor: colors.border,
                            ...(style === 'glass' ? { shadowOpacity: 0.1 } : {})
                        }
                    ]}
                >
                    {variant === 'bottom-sheet' && <View style={[styles.grabber, { backgroundColor: colors.border }]} />}
                    <View style={styles.content}>
                        <View style={styles.iconWrapper}>
                            {getTypeIcon()}
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.message, { color: colors.text, opacity: 0.7 }]}>{message}</Text>
                    </View>

                    <View style={[styles.buttonRow, { borderTopColor: colors.border }]}>
                        {finalButtons.map((btn, index) => {
                            const isDestructive = btn.style === 'destructive';
                            const isCancel = btn.style === 'cancel';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        index > 0 ? { borderLeftWidth: 1, borderLeftColor: colors.border } : {},
                                        finalButtons.length === 1 ? { flex: 1 } : { flex: 1 } // ensure equal width
                                    ]}
                                    onPress={() => handleButtonPress(btn)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        {
                                            color: isDestructive ? '#F44336' : isCancel ? colors.text : colors.primary,
                                            fontWeight: (isDestructive || !isCancel) ? 'bold' : 'normal',
                                            opacity: isCancel ? 0.6 : 1
                                        }
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdropBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        width: width * 0.8,
        maxWidth: 340,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    bottomSheet: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    grabber: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
    }
});

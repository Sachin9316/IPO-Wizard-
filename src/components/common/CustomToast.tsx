import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose?: () => void;
}

export const CustomToast: React.FC<ToastOptions & { onClose: () => void }> = ({
    message, type = 'info', onClose
}) => {
    const { colors } = useTheme();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 20,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();

        // Start exit animation after 2.5s (UIContext hides it at 3s)
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start();
        }, 2500);

        return () => clearTimeout(timeout);
    }, []);

    const getIcon = () => {
        const size = 18;
        switch (type) {
            case 'success': return <CheckCircle2 size={size} color="#fff" />;
            case 'error': return <X size={size} color="#fff" />;
            case 'warning': return <AlertTriangle size={size} color="#fff" />;
            default: return <Info size={size} color="#fff" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return colors.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: getBgColor(),
                    opacity: opacity,
                    transform: [{ translateY: translateY }]
                }
            ]}
        >
            <View style={styles.iconWrapper}>
                {getIcon()}
            </View>
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingHorizontal: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 9999,
        maxWidth: 500,
        alignSelf: 'center',
    },
    iconWrapper: {
        marginRight: 10,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    }
});

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Modal } from 'react-native';
import { CustomAlert, AlertOptions } from '../components/common/CustomAlert';
import { CustomToast, ToastOptions } from '../components/common/CustomToast';

interface UIContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
    showToast: (options: ToastOptions | string) => void;
    headerFilter: 'ALL' | 'SME' | 'MAINBOARD';
    setHeaderFilter: (filter: 'ALL' | 'SME' | 'MAINBOARD') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState<AlertOptions & { variant?: 'centered' | 'bottom-sheet', style?: 'classic' | 'modern' | 'glass' } | null>(null);
    const [toastConfig, setToastConfig] = useState<ToastOptions | null>(null);
    const [headerFilter, setHeaderFilter] = useState<'ALL' | 'SME' | 'MAINBOARD'>('ALL');

    const showAlert = useCallback((options: AlertOptions & { variant?: 'centered' | 'bottom-sheet', style?: 'classic' | 'modern' | 'glass' }) => {
        setAlertConfig(options);
    }, []);

    const hideAlert = useCallback(() => {
        setAlertConfig(null);
    }, []);

    const showToast = useCallback((options: ToastOptions | string) => {
        if (typeof options === 'string') {
            setToastConfig({ message: options, type: 'info' });
        } else {
            setToastConfig(options);
        }

        // Auto hide toast after 3 seconds
        setTimeout(() => {
            setToastConfig(null);
        }, 3000);
    }, []);

    const contextValue = React.useMemo(() => ({
        showAlert, hideAlert, showToast, headerFilter, setHeaderFilter
    }), [showAlert, hideAlert, showToast, headerFilter]);

    return (
        <UIContext.Provider value={contextValue}>
            {children}
            {alertConfig && (
                <CustomAlert
                    {...alertConfig}
                    onClose={() => {
                        hideAlert();
                        if (alertConfig.onClose) alertConfig.onClose();
                    }}
                />
            )}
            {toastConfig && (
                <CustomToast
                    {...toastConfig}
                    onClose={() => setToastConfig(null)}
                />
            )}
        </UIContext.Provider>
    );
};

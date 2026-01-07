import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesContextType {
    isPanMasked: boolean;
    togglePanMask: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const [isPanMasked, setIsPanMasked] = useState(false); // Default to unmasked

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const stored = await AsyncStorage.getItem('pref_mask_pan');
            if (stored !== null) {
                setIsPanMasked(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load preferences', e);
        }
    };

    const togglePanMask = async () => {
        try {
            const newValue = !isPanMasked;
            setIsPanMasked(newValue);
            await AsyncStorage.setItem('pref_mask_pan', JSON.stringify(newValue));
        } catch (e) {
            console.error('Failed to save preference', e);
        }
    };

    return (
        <PreferencesContext.Provider value={{ isPanMasked, togglePanMask }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

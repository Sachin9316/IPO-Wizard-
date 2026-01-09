import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { UIProvider } from './src/context/UIContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { PreferencesProvider } from './src/context/PreferencesContext';

const AppContent = () => {
    const { theme, colors } = useTheme();

    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: '#BB86FC',
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: '#FF80AB',
        },
    };

    const MyLightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#6200EE',
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: '#F50057',
        },
    };

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <NavigationContainer theme={theme === 'dark' ? MyDarkTheme : MyLightTheme}>
                <RootNavigator />
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <ThemeProvider>
                    <PreferencesProvider>
                        <UIProvider>
                            <AuthProvider>
                                <AppContent />
                            </AuthProvider>
                        </UIProvider>
                    </PreferencesProvider>
                </ThemeProvider>
            </Provider>
        </SafeAreaProvider>
    );
}

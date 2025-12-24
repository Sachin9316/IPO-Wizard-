import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const AppContent = () => {
    const { theme } = useTheme();

    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: '#BB86FC',
            background: '#121212',
            card: '#1E1E1E',
            text: '#FFFFFF',
            border: '#333333',
            notification: '#FF80AB',
        },
    };

    const MyLightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#6200EE',
            background: '#FFFFFF',
            card: '#FFFFFF',
            text: '#000000',
            border: '#E0E0E0',
            notification: '#F50057',
        },
    };

    return (
        <NavigationContainer theme={theme === 'dark' ? MyDarkTheme : MyLightTheme}>
            <RootNavigator />
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

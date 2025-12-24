import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SavedPANsScreen } from '../screens/pans/SavedPANsScreen';
import { UnsavedPANsScreen } from '../screens/pans/UnsavedPANsScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createMaterialTopTabNavigator();

export const PANsNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: colors.background },
                tabBarLabelStyle: { fontWeight: 'bold' },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text,
                tabBarIndicatorStyle: { backgroundColor: colors.primary },
            }}
        >
            <Tab.Screen name="Saved PANs" component={SavedPANsScreen} />
            <Tab.Screen name="Unsaved PANs" component={UnsavedPANsScreen} />
        </Tab.Navigator>
    );
};

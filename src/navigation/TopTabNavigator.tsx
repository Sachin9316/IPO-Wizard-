import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { IPOListScreen } from '../screens/IPOListScreen';
import { useTheme } from '../theme/ThemeContext';

export type TopTabParamList = {
    Mainboard: { type: 'Mainboard' };
    SME: { type: 'SME' };
    Alloted: { type: 'Alloted' };
};

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

export const TopTabNavigator = () => {
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
            <Tab.Screen
                name="Mainboard"
                component={IPOListScreen}
                initialParams={{ type: 'Mainboard' }}
                options={{ title: 'Mainboard' }}
            />
            <Tab.Screen
                name="SME"
                component={IPOListScreen}
                initialParams={{ type: 'SME' }}
                options={{ title: 'SME' }}
            />
            <Tab.Screen
                name="Alloted"
                component={IPOListScreen}
                initialParams={{ type: 'Alloted' }}
                options={{ title: 'Alloted IPOs' }}
            />
        </Tab.Navigator>
    );
};

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { IPOListScreen } from '../screens/IPOListScreen';
import { useTheme } from '../theme/ThemeContext';

export type TopTabParamList = {
    Mainboard: { type: 'Mainboard' };
    SME: { type: 'SME' };
    Listed: { type: 'Listed' };
    Alloted: { type: 'Alloted' };
    Watchlist: { type: 'Watchlist' };
    Open: { type: 'Open' };
    ClosedListed: { type: 'ClosedListed' };
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
                tabBarScrollEnabled: true,
                tabBarItemStyle: { width: 'auto', minWidth: 100 },
            }}
        >
            <Tab.Screen
                name="Open"
                component={IPOListScreen}
                initialParams={{ type: 'Open' }}
                options={{ title: 'Upcoming' }}
            />
            <Tab.Screen
                name="Mainboard"
                component={IPOListScreen}
                initialParams={{ type: 'Mainboard' }}
                options={{ title: 'Open/Mainboard' }}
            />
            <Tab.Screen
                name="SME"
                component={IPOListScreen}
                initialParams={{ type: 'SME' }}
                options={{ title: 'Open/SME' }}
            />
            <Tab.Screen
                name="ClosedListed"
                component={IPOListScreen}
                initialParams={{ type: 'ClosedListed' }}
                options={{ title: 'Closed/Listed' }}
            />

            <Tab.Screen
                name="Watchlist"
                component={IPOListScreen}
                initialParams={{ type: 'Watchlist' }}
                options={{ title: 'Watchlist' }}
            />
        </Tab.Navigator>
    );
};

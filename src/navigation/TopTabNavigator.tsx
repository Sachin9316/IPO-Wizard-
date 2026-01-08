import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { IPOListScreen } from '../screens/IPOListScreen';
import { useTheme } from '../theme/ThemeContext';

export type TopTabParamList = {
    Upcoming: { type: 'Upcoming' };
    Open: { type: 'Open' };
    Listed: { type: 'Listed' };
    Alloted: { type: 'Alloted' };
    Watchlist: { type: 'Watchlist' };
    ClosedListed: { type: 'ClosedListed' };
};

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

export const TopTabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: colors.background },
                tabBarLabelStyle: { fontWeight: 'bold', textTransform: 'capitalize' },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text,
                tabBarIndicatorStyle: {
                    backgroundColor: colors.primary,
                    height: 3,
                    borderRadius: 3,
                    marginBottom: 2
                },
                tabBarScrollEnabled: true,
                tabBarItemStyle: { width: 'auto', minWidth: 90 },
            }}
        >
            <Tab.Screen
                name="Upcoming"
                component={IPOListScreen}
                initialParams={{ type: 'Upcoming' }}
                options={{ title: 'Upcoming' }}
            />
            <Tab.Screen
                name="Open"
                component={IPOListScreen}
                initialParams={{ type: 'Open' }}
                options={{ title: 'Open' }}
            />
            <Tab.Screen
                name="ClosedListed"
                component={IPOListScreen}
                initialParams={{ type: 'ClosedListed' }}
                options={{ title: 'Closed' }}
            />

            <Tab.Screen
                name="Allotment"
                component={IPOListScreen}
                initialParams={{ type: 'Alloted' }}
                options={{ title: 'Allotment' }}
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

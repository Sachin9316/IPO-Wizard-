import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TopTabNavigator } from './TopTabNavigator';
import { PANsNavigator } from './PANsNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomHeader } from '../components/CustomHeader';
import { Home, PieChart, User, CreditCard } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                header: ({ route }) => {
                    if (route.name === "Home") return <CustomHeader title="Mainboard Ipos" />;
                    return <CustomHeader title={route.name} />;
                },
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text,
            }}
        >
            <Tab.Screen
                name="Home"
                component={TopTabNavigator}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="PANs"
                component={PANsNavigator}
                options={{
                    tabBarLabel: 'PANs',
                    tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                    headerShown: true,
                    header: () => <CustomHeader title="PAN's" />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                    headerShown: true,
                    header: () => <CustomHeader title="Profile" />
                }}
            />
        </Tab.Navigator >
    );
};

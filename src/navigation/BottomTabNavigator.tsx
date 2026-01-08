import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TopTabNavigator } from './TopTabNavigator';
import { IPOListScreen } from '../screens/IPOListScreen';
import { PANsNavigator } from './PANsNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomHeader } from '../components/CustomHeader';
import { Home, PieChart, User, CreditCard, Newspaper, Crown } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { InsightsScreen } from '../screens/InsightsScreen';
import { NewsScreen } from '../screens/NewsScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                header: ({ route }) => {
                    if (route.name === "Home") return <CustomHeader title="IPOs" />;
                    return <CustomHeader title={route.name} />;
                },
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 0,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 70,
                    paddingBottom: 10,
                },
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 12,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text,
            }}
        >
            <Tab.Screen
                name="Home"
                component={TopTabNavigator}
                options={{
                    tabBarLabel: 'IPOs',
                    tabBarIcon: ({ color, size }) => <Crown color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="News"
                component={NewsScreen}
                options={{
                    header: () => <CustomHeader title="IPO News" showSearch={false} />,
                    tabBarLabel: 'News',
                    tabBarIcon: ({ color, size }) => (
                        <Newspaper color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="PANs"
                component={PANsNavigator}
                options={{
                    tabBarLabel: 'PANs',
                    tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                    headerShown: true,
                    header: () => <CustomHeader title="PAN's" showActions={false} />
                }}
            />
            {/* <Tab.Screen
                name="Insights"
                component={InsightsScreen}
                options={{
                    tabBarLabel: 'Insights',
                    tabBarIcon: ({ color, size }) => <Newspaper color={color} size={size} />,
                    headerShown: false,
                }}
            /> */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                    headerShown: true,
                    header: () => <CustomHeader title="Profile" showActions={false} />
                }}
            />
        </Tab.Navigator >
    );
};

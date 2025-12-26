import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabNavigator } from './BottomTabNavigator';
import { IPODetailsScreen } from '../screens/details/IPODetailsScreen';
import { SubscriptionScreen } from '../screens/details/SubscriptionScreen';
import { GMPScreen } from '../screens/details/GMPScreen';
import { AllotmentResultScreen } from '../screens/details/AllotmentResultScreen';
import { IPOData } from '../types/ipo';
import { SearchScreen } from '../screens/SearchScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { LicensesScreen } from '../screens/LicensesScreen';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    Root: { screen?: string } | undefined;
    IPODetails: { ipo: IPOData };
    SubscriptionStatus: { subscriptionDetails: any, name: string };
    GMPStatus: { gmpDetails: any, name: string };
    AllotmentResult: { ipoName: string; registrarLink?: string };
    Search: undefined;
    PrivacyPolicy: undefined;
    Licenses: undefined;
};
export const RootNavigator = () => {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                contentStyle: { backgroundColor: colors.background }
            }}
        >
            <Stack.Screen
                name="Root"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="IPODetails"
                component={IPODetailsScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="SubscriptionStatus"
                component={SubscriptionScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="GMPStatus"
                component={GMPScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="AllotmentResult"
                component={AllotmentResultScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Licenses"
                component={LicensesScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

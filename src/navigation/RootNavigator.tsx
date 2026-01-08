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
import { ReportIssueScreen } from '../screens/ReportIssueScreen';
import { NewsViewerScreen } from '../screens/NewsViewerScreen';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    Root: { screen?: string } | undefined;
    IPODetails: { ipo: IPOData };
    SubscriptionStatus: { ipo: IPOData };
    GMPStatus: { ipo: IPOData };
    AllotmentResult: { ipo: IPOData };
    Search: undefined;
    PrivacyPolicy: undefined;
    Licenses: undefined;
    ReportIssue: { ipoName: string; userName: string; panNumber: string; allotmentStatus: string };
    NewsViewer: { url: string; title: string };
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
            <Stack.Screen
                name="ReportIssue"
                component={ReportIssueScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewsViewer"
                component={NewsViewerScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

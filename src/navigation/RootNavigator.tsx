import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { IPODetailsScreen } from '../screens/details/IPODetailsScreen';
// Auth screens removed in favor of Magic Link in Profile
// import { LoginScreen } from '../screens/auth/LoginScreen';
// import { RegisterScreen } from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    MainTabs: undefined;
    IPOData: { ipoId: string };
    SubscriptionStatus: { ipoId: string };
};
export const RootNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Root"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="IPODetails"
                component={IPODetailsScreen}
                options={{
                    presentation: 'modal',
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

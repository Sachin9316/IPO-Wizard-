import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { IPODetailsScreen } from '../screens/details/IPODetailsScreen';

const Stack = createNativeStackNavigator();

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

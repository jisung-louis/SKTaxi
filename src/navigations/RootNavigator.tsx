import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthState } from '../types/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading }: AuthState = useAuthContext();

  if (loading) {
    return null; // TODO: 로딩 화면 추가
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}; 
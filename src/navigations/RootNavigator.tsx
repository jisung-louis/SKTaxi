import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthState } from '../types/auth';
import { Alert } from 'react-native';
import { initForegroundMessageHandler } from '../lib/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading }: AuthState = useAuthContext();
  const [joinData, setJoinData] = useState<any | null>(null);

  // SKTaxi: 파티 삭제 알림 핸들러
  const handlePartyDeleted = () => {
    Alert.alert(
      '파티가 해체되었어요',
      '리더가 파티를 해체했습니다.',
      [
        {
          text: '확인',
          onPress: () => {
            // SKTaxi: 앱 상태를 리셋하여 메인 화면으로 이동
            // 네비게이션은 자동으로 처리됨
          },
        },
      ]
    );
  };

  // SKTaxi: FCM 메시지 핸들러 등록
  useEffect(() => {
    if (user) {
      initForegroundMessageHandler(setJoinData, handlePartyDeleted);
    }
  }, [user]);

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
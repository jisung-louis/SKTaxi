/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigations/RootNavigator';
import './src/config/firebase';
import auth from '@react-native-firebase/auth';

const App = () => {
  // SKTaxi: 모달 상태는 RootNavigator로 이동


  useEffect(() => {
    // SKTaxi: 간소화 정책 - 앱 시작 즉시 저장 로직은 제거하고 로그인 성공 시점에서만 저장
    // SKTaxi: 포그라운드 메시지 처리 핸들러는 RootNavigator에서 등록
    // SKTaxi: 토큰 리프레시 구독은 생략(간소화). 필요 시 아래 주석 해제
    // const unsub = subscribeFcmTokenRefresh();
    const unsubAuth = auth().onAuthStateChanged(() => {});
    return () => { unsubAuth(); };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

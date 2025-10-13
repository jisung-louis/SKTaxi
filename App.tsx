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
// SKTaxi: 앱 진입 시 FCM 토큰 저장 로직을 추가
import { ensureFcmTokenSaved, subscribeFcmTokenRefresh } from './src/lib/fcm';
// SKTaxi: 포그라운드 푸시 수신 → 모달 수락/거절 처리 연결
import { acceptJoin, declineJoin } from './src/lib/notifications';
import { Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, { doc, getDoc } from '@react-native-firebase/firestore';
import { JoinRequestModal } from './src/components/common/JoinRequestModal';

const App = () => {
  const [joinData, setJoinData] = useState<any | null>(null);
  const [requesterName, setRequesterName] = useState<string>('');


  // SKTaxi: 요청자 displayName 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!joinData?.requesterId) { setRequesterName(''); return; }
      try {
        const snap = await getDoc(doc(firestore(), 'users', String(joinData.requesterId)));
        if (!cancelled) setRequesterName((snap.data() as any)?.displayName || '익명');
      } catch {
        if (!cancelled) setRequesterName('익명');
      }
    })();
    return () => { cancelled = true; };
  }, [joinData?.requesterId]);
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
            <JoinRequestModal
              visible={!!joinData}
              requesterName={requesterName}
              onDecline={() => { if (joinData) declineJoin(joinData.requestId); setJoinData(null); }}
              onAccept={() => { if (joinData) acceptJoin(joinData.requestId, joinData.partyId, joinData.requesterId); setJoinData(null); }}
              onRequestClose={() => setJoinData(null)}
            />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

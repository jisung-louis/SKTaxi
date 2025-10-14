import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthState } from '../types/auth';
import { Alert, AppState } from 'react-native';
import { initForegroundMessageHandler } from '../lib/notifications';
import { ensureFcmTokenSaved, subscribeFcmTokenRefresh } from '../lib/fcm';
import { JoinRequestModal } from '../components/common/JoinRequestModal';
import { acceptJoin, declineJoin } from '../lib/notifications';
import firestore, { doc, getDoc } from '@react-native-firebase/firestore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading }: AuthState = useAuthContext();
  const [joinData, setJoinData] = useState<any | null>(null);
  const [requesterName, setRequesterName] = useState<string>('');

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
    let unsubscribeTokenRefresh: (() => void) | undefined;
    if (user) {
      initForegroundMessageHandler(setJoinData, handlePartyDeleted);
      // SKTaxi: 앱 시작(로그인된 상태)마다 토큰 확인+저장
      ensureFcmTokenSaved().catch(() => {});
      // SKTaxi: 토큰 회전 즉시 저장
      unsubscribeTokenRefresh = subscribeFcmTokenRefresh();
    }
    return () => {
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
    };
  }, [user]);

  // SKTaxi: 요청자 displayName 조회 (모달용)
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

  if (loading) {
    return null; // TODO: 로딩 화면 추가
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      {/* SKTaxi: 포그라운드 푸시 → 동승요청 모달 (네비게이터 바깥에 위치) */}
      <JoinRequestModal
        visible={!!joinData}
        requesterName={requesterName}
        onDecline={() => { if (joinData) declineJoin(joinData.requestId); setJoinData(null); }}
        onAccept={() => { if (joinData) acceptJoin(joinData.requestId, joinData.partyId, joinData.requesterId); setJoinData(null); }}
        onRequestClose={() => setJoinData(null)}
      />
    </>
  );
}; 
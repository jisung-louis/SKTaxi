import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuthContext } from '../contexts/AuthContext';
import { JoinRequestProvider } from '../contexts/JoinRequestContext';
import { AuthState } from '../types/auth';
import { Alert, AppState, TouchableOpacity, Text } from 'react-native';
import { initForegroundMessageHandler, initBackgroundMessageHandler, initNotificationOpenedAppHandler, checkInitialNotification } from '../lib/notifications';
import { ensureFcmTokenSaved, subscribeFcmTokenRefresh } from '../lib/fcm';
import { JoinRequestModal } from '../components/common/JoinRequestModal';
import { ForegroundNotification } from '../components/common/ForegroundNotification';
import { acceptJoin, declineJoin } from '../lib/notifications';
import firestore, { doc, getDoc } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading }: AuthState = useAuthContext();
  const [joinData, setJoinData] = useState<any | null>(null);
  const [requesterName, setRequesterName] = useState<string>('');
  const [foregroundNotification, setForegroundNotification] = useState<{
    visible: boolean;
    title: string;
    body: string;
    noticeId?: string;
  }>({
    visible: false,
    title: '',
    body: '',
  });
  const navigation = useNavigation();

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

  // SKTaxi: 공지사항 알림 핸들러
  const handleNoticeReceived = (noticeId: string, noticeTitle?: string, noticeCategory?: string) => {
    console.log('🔔 포그라운드에서 공지사항 알림 수신:', noticeId);
    
    // FCM 메시지에서 받은 정보 사용
    const title = noticeTitle || '새로운 공지사항';
    const category = noticeCategory || '일반';
    
    // 포그라운드 알림 표시
    setForegroundNotification({
      visible: true,
      title: `📢 새 성결대 ${category} 공지`,
      body: title,
      noticeId: noticeId,
    });
    
    console.log('🔔 포그라운드 알림 상태 업데이트:', {
      visible: true,
      title: `📢 새 성결대 ${category} 공지`,
      body: title,
      noticeId: noticeId,
    });
  };

  // SKTaxi: 포그라운드 알림 클릭 핸들러
  const handleForegroundNotificationPress = () => {
    if (foregroundNotification.noticeId) {
      // Main 탭의 공지 스택으로 이동
      (navigation as any).navigate('Main', {
        screen: '공지',
        params: {
          screen: 'NoticeDetail',
          params: { noticeId: foregroundNotification.noticeId }
        }
      });
    }
    setForegroundNotification(prev => ({ ...prev, visible: false }));
  };

  // SKTaxi: 포그라운드 알림 닫기 핸들러
  const handleForegroundNotificationDismiss = () => {
    setForegroundNotification(prev => ({ ...prev, visible: false }));
  };

  // SKTaxi: 테스트용 포그라운드 알림 표시 함수
  const testForegroundNotification = () => {
    console.log('🧪 테스트 포그라운드 알림 표시');
    setForegroundNotification({
      visible: true,
      title: '🧪 테스트 알림',
      body: '포그라운드 알림 테스트입니다',
      noticeId: 'test',
    });
  };

  // SKTaxi: FCM 메시지 핸들러 등록
  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;
    if (user) {
      // 포그라운드 알림 처리
      initForegroundMessageHandler(setJoinData, handlePartyDeleted, handleNoticeReceived);
      
      // 백그라운드 알림 처리
      initBackgroundMessageHandler(setJoinData);
      
      // 앱이 백그라운드에서 알림을 클릭했을 때 처리
      initNotificationOpenedAppHandler(navigation, setJoinData);
      
      // 앱이 완전히 종료된 상태에서 알림을 클릭했을 때 처리
      checkInitialNotification(navigation, setJoinData);
      
      // SKTaxi: 앱 시작(로그인된 상태)마다 토큰 확인+저장
      ensureFcmTokenSaved().catch(() => {});
      // SKTaxi: 토큰 회전 즉시 저장
      unsubscribeTokenRefresh = subscribeFcmTokenRefresh();
    }
    return () => {
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
    };
  }, [user, navigation]);

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
      
      {/* SKTaxi: 포그라운드 알림 */}
      <ForegroundNotification
        visible={foregroundNotification.visible}
        title={foregroundNotification.title}
        body={foregroundNotification.body}
        onPress={handleForegroundNotificationPress}
        onDismiss={handleForegroundNotificationDismiss}
      />
      
      {/* SKTaxi: 테스트 버튼 (개발용) */}
      {/* {__DEV__ && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 100,
            right: 20,
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 5,
            zIndex: 10000,
          }}
          onPress={testForegroundNotification}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>테스트 알림</Text>
        </TouchableOpacity>
      )} */}
    </>
  );
}; 
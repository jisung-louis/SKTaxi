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
import { acceptJoin, declineJoin, deleteJoinRequestNotifications } from '../lib/notifications';
import firestore, { doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import { useNavigation, useNavigationState, CommonActions } from '@react-navigation/native';

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
    partyId?: string;
    postId?: string;
    type?: 'notice' | 'chat' | 'settlement' | 'kicked' | 'party_created' | 'board_notification' | 'notice_notification';
  }>({
    visible: false,
    title: '',
    body: '',
  });
  const navigation = useNavigation();
  
  // SKTaxi: 현재 화면 이름 가져오기
  const getCurrentScreen = () => {
    const state = (navigation as any).getState?.();
    if (!state) return undefined;
    
    const mainTabRoute = state.routes?.find((r: any) => r.name === 'Main');
    if (!mainTabRoute) return undefined;
    
    const mainTabState = mainTabRoute.state;
    if (!mainTabState) return undefined;
    
    const tabRoute = mainTabState.routes?.[mainTabState.index];
    if (!tabRoute) return undefined;
    
    const stackState = tabRoute.state;
    if (!stackState) return undefined;
    
    const stackRoute = stackState.routes?.[stackState.index];
    return stackRoute?.name;
  };

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
    if (foregroundNotification.type === 'notice' && foregroundNotification.noticeId) {
      // Main 탭의 공지 스택으로 이동
      (navigation as any).navigate('Main', {
        screen: '공지',
        params: {
          screen: 'NoticeDetail',
          params: { noticeId: foregroundNotification.noticeId }
        }
      });
    } else if (foregroundNotification.type === 'chat' && foregroundNotification.partyId) {
      // Main 탭의 택시 스택의 Chat 화면으로 이동
      (navigation as any).navigate('Main', {
        screen: '택시',
        params: {
          screen: 'Chat',
          params: { partyId: foregroundNotification.partyId }
        }
      });
    } else if (foregroundNotification.type === 'settlement' && foregroundNotification.partyId) {
      // Main 탭의 택시 스택의 Chat 화면으로 이동
      (navigation as any).navigate('Main', {
        screen: '택시',
        params: {
          screen: 'Chat',
          params: { partyId: foregroundNotification.partyId }
        }
      });
    } else if (foregroundNotification.type === 'kicked') {
      // 강퇴 알림 클릭 시 메인 화면으로 이동
      (navigation as any).popToTop();
    } else if (foregroundNotification.type === 'party_created' && foregroundNotification.partyId) {
      // 새 파티 생성 알림 클릭 시 택시 탭의 파티 목록으로 이동
      (navigation as any).navigate('Main', {
        screen: '택시',
      });
    } else if (foregroundNotification.type === 'board_notification' && foregroundNotification.postId) {
      // 게시판 알림 클릭 시 게시판 상세 화면으로 이동
      console.log('🔔 게시판 알림 클릭 - postId:', foregroundNotification.postId);
      try {
        (navigation as any).navigate('Main', {
          screen: '게시판',
          params: {
            screen: 'BoardDetail',
            params: { postId: foregroundNotification.postId }
          }
        });
        console.log('✅ 게시판 네비게이션 성공');
      } catch (error) {
        console.error('❌ 게시판 네비게이션 실패:', error);
        // 대체 방법: 게시판 탭으로 먼저 이동
        (navigation as any).navigate('Main', { screen: '게시판' });
      }
    } else if (foregroundNotification.type === 'notice_notification' && foregroundNotification.noticeId) {
      // 공지사항 알림 클릭 시 공지사항 상세 화면으로 이동
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

  // SKTaxi: 동승 요청 승인 핸들러
  const handleJoinRequestAccepted = (partyId: string) => {
    (navigation as any).navigate('Main', {
      screen: '택시',
      params: {
        screen: 'Chat',
        params: { partyId },
      },
    });
  };

  // SKTaxi: 동승 요청 거절 핸들러
  const handleJoinRequestRejected = () => {
    // AcceptancePendingScreen에서 이미 Alert를 표시하므로 여기서는 네비게이션만 처리
    (navigation as any).popToTop();
  };

  // SKTaxi: 채팅 메시지 수신 핸들러
  const handleChatMessageReceived = (data: { senderName: string; messageText: string; partyId: string }) => {
    setForegroundNotification({
      visible: true,
      title: `${data.senderName}님의 메시지`,
      body: data.messageText,
      partyId: data.partyId,
      type: 'chat',
    });
  };

  // SKTaxi: 정산 완료 수신 핸들러
  const handleSettlementCompleted = (partyId: string) => {
    setForegroundNotification({
      visible: true,
      title: '모든 정산이 완료되었어요',
      body: '동승 파티 종료 준비가 되었습니다.',
      partyId: partyId,
      type: 'settlement',
    });
  };

  // SKTaxi: 멤버 강퇴 알림 핸들러
  const handleMemberKicked = () => {
    setForegroundNotification({
      visible: true,
      title: '파티에서 강퇴되었어요',
      body: '리더가 당신을 파티에서 나가게 했습니다.',
      type: 'kicked',
    });
  };

  // SKTaxi: 새 파티 생성 알림 핸들러
  const handlePartyCreated = (data: { partyId: string; title: string; body: string }) => {
    setForegroundNotification({
      visible: true,
      title: data.title,
      body: data.body,
      partyId: data.partyId,
      type: 'party_created',
    });
  };

  // SKTaxi: 게시판 알림 핸들러
  const handleBoardNotificationReceived = (data: { postId: string; type: string; title: string; body: string }) => {
    setForegroundNotification({
      visible: true,
      title: data.title,
      body: data.body,
      postId: data.postId,
      type: 'board_notification',
    });
  };

  // SKTaxi: 공지사항 알림 핸들러
  const handleNoticeNotificationReceived = (data: { noticeId: string; type: string; title: string; body: string }) => {
    setForegroundNotification({
      visible: true,
      title: data.title,
      body: data.body,
      noticeId: data.noticeId,
      type: 'notice_notification',
    });
  };

  // SKTaxi: FCM 메시지 핸들러 등록
  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;
    if (user) {
      // 포그라운드 알림 처리
      initForegroundMessageHandler(
        setJoinData, 
        handlePartyDeleted, 
        handleNoticeReceived,
        handleJoinRequestAccepted,
        handleJoinRequestRejected,
        handleChatMessageReceived,
        getCurrentScreen,
        handleSettlementCompleted,
        handleMemberKicked,
        handlePartyCreated,
        handleBoardNotificationReceived,
        handleNoticeNotificationReceived
      );
      
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

  // SKTaxi: joinRequest 상태 실시간 구독 (취소 상태 감지)
  useEffect(() => {
    if (!joinData?.requestId) return;

    const requestDocRef = doc(firestore(), 'joinRequests', joinData.requestId);
    const unsubscribe = onSnapshot(requestDocRef, (snap) => {
      const data = snap.data();
      if (data?.status === 'canceled') {
        // SKTaxi: 요청이 취소되면 모달 닫기
        setJoinData(null);
      }
    });

    return () => unsubscribe();
  }, [joinData?.requestId]);

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
        onDecline={async () => { 
          if (joinData && user?.uid) {
            await declineJoin(joinData.requestId);
            // SKTaxi: 리더(현재 사용자)의 동승 요청 알림 삭제
            await deleteJoinRequestNotifications(user.uid, joinData.partyId);
          }
          setJoinData(null); 
        }}
        onAccept={async () => { 
          if (joinData && user?.uid) {
            await acceptJoin(joinData.requestId, joinData.partyId, joinData.requesterId);
            // SKTaxi: 리더(현재 사용자)의 동승 요청 알림 삭제
            await deleteJoinRequestNotifications(user.uid, joinData.partyId);
          }
          setJoinData(null); 
        }}
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
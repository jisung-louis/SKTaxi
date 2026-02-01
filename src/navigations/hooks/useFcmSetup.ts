// SKTaxi: FCM 설정 훅 (SRP 분리)
// RootNavigator에서 분리된 FCM 초기화 및 토큰 관리

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  initForegroundMessageHandler,
  initBackgroundMessageHandler,
  initNotificationOpenedAppHandler,
  checkInitialNotification,
} from '../../lib/notifications';
import { ensureFcmTokenSaved, subscribeFcmTokenRefresh } from '../../lib/fcm';

export interface UseFcmSetupParams {
  userId: string | undefined;
  needsProfile: boolean;
  permissionsComplete: boolean;
  // 포그라운드 알림 핸들러
  setJoinData: (data: any) => void;
  handlePartyDeleted: () => void;
  handleNoticeReceived: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void;
  handleAppNoticeNotificationReceived: (data: { appNoticeId: string; title: string }) => void;
  handleJoinRequestAccepted: (partyId: string) => void;
  handleJoinRequestRejected: () => void;
  handleChatMessageReceived: (data: { senderName: string; messageText: string; partyId: string }) => void;
  getCurrentScreen: () => string | undefined;
  handleSettlementCompleted: (partyId: string) => void;
  handleMemberKicked: () => void;
  handlePartyCreated: (data: { partyId: string; title: string; body: string }) => void;
  handleBoardNotificationReceived: (data: { postId: string; type: string; title: string; body: string }) => void;
  handleNoticeNotificationReceived: (data: { noticeId: string; type: string; title: string; body: string }) => void;
  handleChatRoomMessageReceived: (data: { chatRoomId: string; senderName: string; messageText: string }) => Promise<void>;
  getCurrentChatRoomId: () => string | undefined;
}

/**
 * FCM 메시지 핸들러 초기화 및 토큰 관리
 */
export function useFcmSetup({
  userId,
  needsProfile,
  permissionsComplete,
  setJoinData,
  handlePartyDeleted,
  handleNoticeReceived,
  handleAppNoticeNotificationReceived,
  handleJoinRequestAccepted,
  handleJoinRequestRejected,
  handleChatMessageReceived,
  getCurrentScreen,
  handleSettlementCompleted,
  handleMemberKicked,
  handlePartyCreated,
  handleBoardNotificationReceived,
  handleNoticeNotificationReceived,
  handleChatRoomMessageReceived,
  getCurrentChatRoomId,
}: UseFcmSetupParams): void {
  const navigation = useNavigation();

  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;

    if (userId && !needsProfile && permissionsComplete) {
      // 포그라운드 알림 처리
      initForegroundMessageHandler(
        setJoinData,
        handlePartyDeleted,
        handleNoticeReceived,
        handleAppNoticeNotificationReceived,
        handleJoinRequestAccepted,
        handleJoinRequestRejected,
        handleChatMessageReceived,
        getCurrentScreen,
        handleSettlementCompleted,
        handleMemberKicked,
        handlePartyCreated,
        handleBoardNotificationReceived,
        handleNoticeNotificationReceived,
        handleChatRoomMessageReceived,
        getCurrentChatRoomId
      );

      // 백그라운드 알림 처리
      initBackgroundMessageHandler(setJoinData);

      // 앱이 백그라운드에서 알림을 클릭했을 때 처리
      initNotificationOpenedAppHandler(navigation, setJoinData);

      // 앱이 완전히 종료된 상태에서 알림을 클릭했을 때 처리
      checkInitialNotification(navigation, setJoinData);

      // 프로필 완료 + 권한 온보딩 완료 후에만 토큰 확인+저장
      ensureFcmTokenSaved().catch(() => {});

      // 토큰 회전 즉시 저장
      unsubscribeTokenRefresh = subscribeFcmTokenRefresh();
    }

    return () => {
      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
      }
    };
  }, [
    userId,
    needsProfile,
    permissionsComplete,
    navigation,
    setJoinData,
    handlePartyDeleted,
    handleNoticeReceived,
    handleAppNoticeNotificationReceived,
    handleJoinRequestAccepted,
    handleJoinRequestRejected,
    handleChatMessageReceived,
    getCurrentScreen,
    handleSettlementCompleted,
    handleMemberKicked,
    handlePartyCreated,
    handleBoardNotificationReceived,
    handleNoticeNotificationReceived,
    handleChatRoomMessageReceived,
    getCurrentChatRoomId,
  ]);
}

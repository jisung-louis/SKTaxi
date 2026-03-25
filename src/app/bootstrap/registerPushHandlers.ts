import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useMemberRepository } from '@/di';
import {
  saveMemberFcmToken,
  subscribeMemberFcmTokenRefresh,
} from '@/features/member';
import {
  checkInitialNotification,
  initBackgroundMessageHandler,
  initForegroundMessageHandler,
  initNotificationOpenedAppHandler,
} from './pushNotificationRuntime';

export interface RegisterPushHandlersParams {
  userId: string | undefined;
  needsProfile: boolean;
  permissionsComplete: boolean;
  setJoinData: (data: any) => void;
  handlePartyDeleted: () => void;
  handleNoticeReceived: (
    noticeId: string,
    noticeTitle?: string,
    noticeCategory?: string,
  ) => void;
  handleAppNoticeNotificationReceived: (data: {
    appNoticeId: string;
    title: string;
  }) => void;
  handleJoinRequestAccepted: (partyId: string) => void;
  handleJoinRequestRejected: () => void;
  handleChatMessageReceived: (data: {
    senderName: string;
    messageText: string;
    partyId: string;
  }) => void;
  getCurrentScreen: () => string | undefined;
  handleSettlementCompleted: (partyId: string) => void;
  handleMemberKicked: () => void;
  handlePartyCreated: (data: {
    partyId: string;
    title: string;
    body: string;
  }) => void;
  handleBoardNotificationReceived: (data: {
    postId: string;
    type: string;
    title: string;
    body: string;
  }) => void;
  handleNoticeNotificationReceived: (data: {
    noticeId: string;
    type: string;
    title: string;
    body: string;
  }) => void;
  handleChatRoomMessageReceived: (data: {
    chatRoomId: string;
    senderName: string;
    messageText: string;
  }) => Promise<void>;
  getCurrentChatRoomId: () => string | undefined;
}

export function useRegisterPushHandlers({
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
}: RegisterPushHandlersParams): void {
  const navigation = useNavigation();
  const memberRepository = useMemberRepository();

  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeOpenedApp: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    if (userId && !needsProfile && permissionsComplete) {
      unsubscribeForeground = initForegroundMessageHandler(
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
      );

      initBackgroundMessageHandler(setJoinData);
      unsubscribeOpenedApp = initNotificationOpenedAppHandler(
        navigation,
        setJoinData,
      );
      checkInitialNotification(navigation, setJoinData);

      saveMemberFcmToken({
        memberRepository,
      }).catch(() => {});
      unsubscribeTokenRefresh = subscribeMemberFcmTokenRefresh({
        memberRepository,
      });
    }

    return () => {
      unsubscribeForeground?.();
      unsubscribeOpenedApp?.();
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
    memberRepository,
  ]);
}

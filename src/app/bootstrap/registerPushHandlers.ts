import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  checkInitialNotification,
  initBackgroundMessageHandler,
  initForegroundMessageHandler,
  initNotificationOpenedAppHandler,
} from '@/lib/notifications';
import { ensureFcmTokenSaved, subscribeFcmTokenRefresh } from '@/lib/fcm';

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

  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;

    if (userId && !needsProfile && permissionsComplete) {
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
        getCurrentChatRoomId,
      );

      initBackgroundMessageHandler(setJoinData);
      initNotificationOpenedAppHandler(navigation, setJoinData);
      checkInitialNotification(navigation, setJoinData);

      ensureFcmTokenSaved().catch(() => {});
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

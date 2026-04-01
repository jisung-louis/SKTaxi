import {useEffect} from 'react';

import {useMemberRepository} from '@/di';
import type {NotificationNavigationIntent} from '@/app/notifications/model/notificationNavigationIntent';
import type {NotificationPayload} from '@/app/notifications/model/notificationPayload';
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

type PartyJoinRequestPayload = Extract<
  NotificationPayload,
  {type: 'PARTY_JOIN_REQUEST'}
>;

export interface RegisterPushHandlersParams {
  getCurrentChatRoomId: () => string | undefined;
  getCurrentScreen: () => string | undefined;
  handleCommunityChatForegroundNotification: (data: {
    chatRoomId: string;
    intent?: NotificationNavigationIntent | null;
    messageText: string;
    senderName: string;
  }) => Promise<void>;
  handleJoinRequestAccepted: (partyId: string) => void;
  handleJoinRequestReceived: (payload: PartyJoinRequestPayload) => void;
  needsProfile: boolean;
  permissionsComplete: boolean;
  showForegroundNotification: (data: {
    body: string;
    intent?: NotificationNavigationIntent | null;
    title: string;
  }) => void;
  userId: string | undefined;
}

export function useRegisterPushHandlers({
  getCurrentChatRoomId,
  getCurrentScreen,
  handleCommunityChatForegroundNotification,
  handleJoinRequestAccepted,
  handleJoinRequestReceived,
  needsProfile,
  permissionsComplete,
  showForegroundNotification,
  userId,
}: RegisterPushHandlersParams): void {
  const memberRepository = useMemberRepository();

  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeOpenedApp: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    if (userId && !needsProfile && permissionsComplete) {
      unsubscribeForeground = initForegroundMessageHandler({
        getCurrentChatRoomId,
        getCurrentScreen,
        onCommunityChatForegroundNotification:
          handleCommunityChatForegroundNotification,
        onForegroundNotification: showForegroundNotification,
        onJoinRequestAccepted: handleJoinRequestAccepted,
        onJoinRequestReceived: handleJoinRequestReceived,
      });

      initBackgroundMessageHandler({
        onJoinRequestReceived: handleJoinRequestReceived,
      });
      unsubscribeOpenedApp = initNotificationOpenedAppHandler({
        onJoinRequestReceived: handleJoinRequestReceived,
      });
      checkInitialNotification({
        onJoinRequestReceived: handleJoinRequestReceived,
      }).catch(() => undefined);

      saveMemberFcmToken({
        memberRepository,
      }).catch(() => undefined);
      unsubscribeTokenRefresh = subscribeMemberFcmTokenRefresh({
        memberRepository,
      });
    }

    return () => {
      unsubscribeForeground?.();
      unsubscribeOpenedApp?.();
      unsubscribeTokenRefresh?.();
    };
  }, [
    getCurrentChatRoomId,
    getCurrentScreen,
    handleCommunityChatForegroundNotification,
    handleJoinRequestAccepted,
    handleJoinRequestReceived,
    memberRepository,
    needsProfile,
    permissionsComplete,
    showForegroundNotification,
    userId,
  ]);
}

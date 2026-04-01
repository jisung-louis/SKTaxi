import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useState} from 'react';

import type {NotificationNavigationIntent} from '@/app/notifications/model/notificationNavigationIntent';
import {getRootNavigationState} from '@/app/navigation/navigationRef';
import {
  getCurrentChatRoomIdFromNavigationState,
} from '@/app/navigation/selectors/getCurrentChatRoomIdFromNavigationState';
import {
  getCurrentRouteNameFromNavigationState,
} from '@/app/navigation/selectors/getCurrentLeafRouteFromNavigationState';
import {handleForegroundNotificationNavigation} from '@/app/navigation/services/notificationNavigation';
import {useAuth} from '@/features/auth';
import {
  resolveChatRoomForegroundNotification,
  useChatRepository,
} from '@/features/chat';

export interface ForegroundNotificationState {
  body: string;
  intent?: NotificationNavigationIntent | null;
  title: string;
  visible: boolean;
}

export interface ForegroundNotificationInput {
  body: string;
  intent?: NotificationNavigationIntent | null;
  title: string;
}

export interface CommunityChatForegroundNotificationInput {
  chatRoomId: string;
  intent?: NotificationNavigationIntent | null;
  messageText: string;
  senderName: string;
}

export interface UseForegroundNotificationRuntimeResult {
  foregroundNotification: ForegroundNotificationState;
  getCurrentChatRoomId: () => string | undefined;
  getCurrentScreen: () => string | undefined;
  handleCommunityChatForegroundNotification: (
    data: CommunityChatForegroundNotificationInput,
  ) => Promise<void>;
  handleForegroundNotificationDismiss: () => void;
  handleForegroundNotificationPress: () => void;
  setForegroundNotification: Dispatch<SetStateAction<ForegroundNotificationState>>;
  showForegroundNotification: (data: ForegroundNotificationInput) => void;
}

export function useForegroundNotificationRuntime(): UseForegroundNotificationRuntimeResult {
  const {user: authUser} = useAuth();
  const chatRepository = useChatRepository();
  const [foregroundNotification, setForegroundNotification] =
    useState<ForegroundNotificationState>({
      body: '',
      title: '',
      visible: false,
    });

  const getCurrentScreen = useCallback(() => {
    return getCurrentRouteNameFromNavigationState(getRootNavigationState());
  }, []);

  const getCurrentChatRoomId = useCallback(() => {
    return getCurrentChatRoomIdFromNavigationState(getRootNavigationState());
  }, []);

  const showForegroundNotification = useCallback(
    ({body, intent, title}: ForegroundNotificationInput) => {
      setForegroundNotification({
        body,
        intent,
        title,
        visible: true,
      });
    },
    [],
  );

  const handleForegroundNotificationPress = useCallback(() => {
    handleForegroundNotificationNavigation({
      intent: foregroundNotification.intent,
    });

    setForegroundNotification(previous => ({
      ...previous,
      visible: false,
    }));
  }, [foregroundNotification.intent]);

  const handleForegroundNotificationDismiss = useCallback(() => {
    setForegroundNotification(previous => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const handleCommunityChatForegroundNotification = useCallback(
    async ({
      chatRoomId,
      intent,
      messageText,
      senderName,
    }: CommunityChatForegroundNotificationInput) => {
      try {
        const notificationPayload =
          await resolveChatRoomForegroundNotification({
            chatRepository,
            chatRoomId,
            department: authUser?.department,
            messageText,
            senderName,
          });

        setForegroundNotification({
          body: notificationPayload.body,
          intent,
          title: notificationPayload.title,
          visible: true,
        });
      } catch (error) {
        console.warn('커뮤니티 채팅 알림 구성에 실패했습니다.', error);
        setForegroundNotification({
          body: `${senderName || '익명'} : ${messageText}`,
          intent,
          title: '채팅방',
          visible: true,
        });
      }
    },
    [authUser?.department, chatRepository],
  );

  return {
    foregroundNotification,
    getCurrentChatRoomId,
    getCurrentScreen,
    handleCommunityChatForegroundNotification,
    handleForegroundNotificationDismiss,
    handleForegroundNotificationPress,
    setForegroundNotification,
    showForegroundNotification,
  };
}

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@/features/auth';
import {
  getCurrentChatRoomIdFromNavigationState,
  navigateToChatRoom,
  resolveChatRoomForegroundNotification,
  useChatRepository,
} from '@/features/chat';
import { navigateToBoardDetail } from '@/features/board';
import {
  buildNoticeForegroundNotification,
  buildNoticePushForegroundNotification,
  navigateToNoticeDetail,
} from '@/features/notice';
import {
  buildAppNoticeForegroundNotification,
  navigateToAppNoticeDetail,
} from '@/features/settings';

export type ForegroundNotificationType =
  | 'notice'
  | 'chat'
  | 'settlement'
  | 'kicked'
  | 'party_created'
  | 'board_notification'
  | 'notice_notification'
  | 'app_notice'
  | 'chat_room_message';

export interface ForegroundNotificationState {
  visible: boolean;
  title: string;
  body: string;
  noticeId?: string;
  partyId?: string;
  postId?: string;
  chatRoomId?: string;
  type?: ForegroundNotificationType;
}

export interface UseForegroundNotificationRuntimeResult {
  foregroundNotification: ForegroundNotificationState;
  setForegroundNotification: Dispatch<SetStateAction<ForegroundNotificationState>>;
  handleForegroundNotificationPress: () => void;
  handleForegroundNotificationDismiss: () => void;
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
  handleChatMessageReceived: (data: {
    senderName: string;
    messageText: string;
    partyId: string;
  }) => void;
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
  getCurrentScreen: () => string | undefined;
  getCurrentChatRoomId: () => string | undefined;
}

export function useForegroundNotificationRuntime(): UseForegroundNotificationRuntimeResult {
  const navigation = useNavigation();
  const { user: authUser } = useAuth();
  const chatRepository = useChatRepository();

  const [foregroundNotification, setForegroundNotification] =
    useState<ForegroundNotificationState>({
      visible: false,
      title: '',
      body: '',
    });

  const getCurrentScreen = useCallback(() => {
    const state = (navigation as any).getState?.();
    if (!state) {
      return undefined;
    }

    const mainTabRoute = state.routes?.find((route: any) => route.name === 'Main');
    if (!mainTabRoute) {
      return undefined;
    }

    const mainTabState = mainTabRoute.state;
    if (!mainTabState) {
      return undefined;
    }

    const tabRoute = mainTabState.routes?.[mainTabState.index];
    if (!tabRoute) {
      return undefined;
    }

    const stackState = tabRoute.state;
    if (!stackState) {
      return undefined;
    }

    const stackRoute = stackState.routes?.[stackState.index];
    return stackRoute?.name;
  }, [navigation]);

  const getCurrentChatRoomId = useCallback(() => {
    const state = (navigation as any).getState?.();
    return getCurrentChatRoomIdFromNavigationState(state);
  }, [navigation]);

  const handleForegroundNotificationPress = useCallback(() => {
    const { type, noticeId, partyId, postId, chatRoomId } =
      foregroundNotification;

    switch (type) {
      case 'notice':
      case 'notice_notification':
        if (noticeId) {
          navigateToNoticeDetail(navigation, noticeId);
        }
        break;
      case 'chat':
      case 'settlement':
        if (partyId) {
          (navigation as any).navigate('Main', {
            screen: 'TaxiTab',
            params: { screen: 'Chat', params: { partyId } },
          });
        }
        break;
      case 'kicked':
        (navigation as any).popToTop();
        break;
      case 'party_created':
        (navigation as any).navigate('Main', { screen: 'TaxiTab' });
        break;
      case 'board_notification':
        if (postId) {
          try {
            navigateToBoardDetail(navigation, postId);
          } catch {
            (navigation as any).navigate('Main', { screen: 'BoardTab' });
          }
        }
        break;
      case 'app_notice':
        if (noticeId) {
          navigateToAppNoticeDetail(navigation, noticeId);
        }
        break;
      case 'chat_room_message':
        if (chatRoomId) {
          navigateToChatRoom(navigation, chatRoomId);
        }
        break;
    }

    setForegroundNotification(previous => ({
      ...previous,
      visible: false,
    }));
  }, [foregroundNotification, navigation]);

  const handleForegroundNotificationDismiss = useCallback(() => {
    setForegroundNotification(previous => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const handlePartyDeleted = useCallback(() => {}, []);

  const handleNoticeReceived = useCallback(
    (noticeId: string, noticeTitle?: string, noticeCategory?: string) => {
      const payload = buildNoticeForegroundNotification({
        noticeCategory,
        noticeId,
        noticeTitle,
      });

      setForegroundNotification({
        visible: true,
        title: payload.title,
        body: payload.body,
        noticeId: payload.noticeId,
        type: payload.type,
      });
    },
    [],
  );

  const handleAppNoticeNotificationReceived = useCallback(
    (data: { appNoticeId: string; title: string }) => {
      const payload = buildAppNoticeForegroundNotification(data);

      setForegroundNotification({
        visible: true,
        title: payload.title,
        body: payload.body,
        noticeId: payload.noticeId,
        type: payload.type,
      });
    },
    [],
  );

  const handleChatMessageReceived = useCallback(
    (data: { senderName: string; messageText: string; partyId: string }) => {
      setForegroundNotification({
        visible: true,
        title: `${data.senderName}님의 메시지`,
        body: data.messageText,
        partyId: data.partyId,
        type: 'chat',
      });
    },
    [],
  );

  const handleSettlementCompleted = useCallback((partyId: string) => {
    setForegroundNotification({
      visible: true,
      title: '모든 정산이 완료되었어요',
      body: '동승 파티 종료 준비가 되었습니다.',
      partyId,
      type: 'settlement',
    });
  }, []);

  const handleMemberKicked = useCallback(() => {
    setForegroundNotification({
      visible: true,
      title: '파티에서 강퇴되었어요',
      body: '리더가 당신을 파티에서 나가게 했습니다.',
      type: 'kicked',
    });
  }, []);

  const handlePartyCreated = useCallback(
    (data: { partyId: string; title: string; body: string }) => {
      setForegroundNotification({
        visible: true,
        title: data.title,
        body: data.body,
        partyId: data.partyId,
        type: 'party_created',
      });
    },
    [],
  );

  const handleBoardNotificationReceived = useCallback(
    (data: { postId: string; type: string; title: string; body: string }) => {
      setForegroundNotification({
        visible: true,
        title: data.title,
        body: data.body,
        postId: data.postId,
        type: 'board_notification',
      });
    },
    [],
  );

  const handleNoticeNotificationReceived = useCallback(
    (data: { noticeId: string; type: string; title: string; body: string }) => {
      const payload = buildNoticePushForegroundNotification(data);

      setForegroundNotification({
        visible: true,
        title: payload.title,
        body: payload.body,
        noticeId: payload.noticeId,
        type: payload.type,
      });
    },
    [],
  );

  const handleChatRoomMessageReceived = useCallback(
    async (data: {
      chatRoomId: string;
      senderName: string;
      messageText: string;
    }) => {
      try {
        const notificationPayload =
          await resolveChatRoomForegroundNotification({
            chatRepository,
            chatRoomId: data.chatRoomId,
            department: authUser?.department,
            messageText: data.messageText,
            senderName: data.senderName,
          });

        setForegroundNotification({
          visible: true,
          title: notificationPayload.title,
          body: notificationPayload.body,
          chatRoomId: notificationPayload.chatRoomId,
          type: 'chat_room_message',
        });
      } catch {
        setForegroundNotification({
          visible: true,
          title: '채팅방',
          body: `${data.senderName || '익명'} : ${data.messageText}`,
          chatRoomId: data.chatRoomId,
          type: 'chat_room_message',
        });
      }
    },
    [authUser?.department, chatRepository],
  );

  return {
    foregroundNotification,
    setForegroundNotification,
    handleForegroundNotificationPress,
    handleForegroundNotificationDismiss,
    handlePartyDeleted,
    handleNoticeReceived,
    handleAppNoticeNotificationReceived,
    handleChatMessageReceived,
    handleSettlementCompleted,
    handleMemberKicked,
    handlePartyCreated,
    handleBoardNotificationReceived,
    handleNoticeNotificationReceived,
    handleChatRoomMessageReceived,
    getCurrentScreen,
    getCurrentChatRoomId,
  };
}

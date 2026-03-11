// SKTaxi: 포그라운드 알림 관리 훅 (SRP 분리)
// RootNavigator에서 분리된 포그라운드 알림 상태 및 핸들러

import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '../../hooks/auth';

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

export interface UseForegroundNotificationResult {
  foregroundNotification: ForegroundNotificationState;
  setForegroundNotification: React.Dispatch<React.SetStateAction<ForegroundNotificationState>>;
  handleForegroundNotificationPress: () => void;
  handleForegroundNotificationDismiss: () => void;
  // 알림 핸들러들
  handlePartyDeleted: () => void;
  handleNoticeReceived: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void;
  handleAppNoticeNotificationReceived: (data: { appNoticeId: string; title: string }) => void;
  handleChatMessageReceived: (data: { senderName: string; messageText: string; partyId: string }) => void;
  handleSettlementCompleted: (partyId: string) => void;
  handleMemberKicked: () => void;
  handlePartyCreated: (data: { partyId: string; title: string; body: string }) => void;
  handleBoardNotificationReceived: (data: { postId: string; type: string; title: string; body: string }) => void;
  handleNoticeNotificationReceived: (data: { noticeId: string; type: string; title: string; body: string }) => void;
  handleChatRoomMessageReceived: (data: { chatRoomId: string; senderName: string; messageText: string }) => Promise<void>;
  // 네비게이션 유틸
  getCurrentScreen: () => string | undefined;
  getCurrentChatRoomId: () => string | undefined;
}

export function useForegroundNotification(): UseForegroundNotificationResult {
  const navigation = useNavigation();
  const { user: authUser } = useAuth();

  const [foregroundNotification, setForegroundNotification] = useState<ForegroundNotificationState>({
    visible: false,
    title: '',
    body: '',
  });

  const getActiveRootRoute = useCallback(() => {
    const state = (navigation as any).getState?.();
    if (!state?.routes?.length) {
      return undefined;
    }
    return state.routes[state.index];
  }, [navigation]);

  // 현재 화면 이름 가져오기
  const getCurrentScreen = useCallback(() => {
    const activeRootRoute = getActiveRootRoute();
    if (!activeRootRoute) {
      return undefined;
    }

    if (activeRootRoute.name === 'My') {
      const myState = activeRootRoute.state;
      if (!myState) {
        return 'MyMain';
      }
      const myRoute = myState.routes?.[myState.index];
      return myRoute?.name;
    }

    if (activeRootRoute.name !== 'Main') {
      return undefined;
    }

    const mainTabState = activeRootRoute.state;
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
  }, [getActiveRootRoute]);

  // 현재 ChatDetail 화면의 chatRoomId 가져오기
  const getCurrentChatRoomId = useCallback(() => {
    const activeRootRoute = getActiveRootRoute();
    if (!activeRootRoute || activeRootRoute.name !== 'Main') {
      return undefined;
    }

    const mainTabState = activeRootRoute.state;
    if (!mainTabState) {
      return undefined;
    }

    const tabRoute = mainTabState.routes?.[mainTabState.index];
    if (!tabRoute || tabRoute.name !== '커뮤니티') {
      return undefined;
    }

    const stackState = tabRoute.state;
    if (!stackState) {
      return undefined;
    }

    const stackRoute = stackState.routes?.[stackState.index];
    if (stackRoute?.name === 'ChatDetail') {
      return stackRoute.params?.chatRoomId;
    }
    return undefined;
  }, [getActiveRootRoute]);

  // 포그라운드 알림 클릭 핸들러
  const handleForegroundNotificationPress = useCallback(() => {
    const { type, noticeId, partyId, postId, chatRoomId } = foregroundNotification;

    switch (type) {
      case 'notice':
        if (noticeId) {
          (navigation as any).navigate('Main', {
            screen: '공지',
            params: { screen: 'NoticeDetail', params: { noticeId } },
          });
        }
        break;
      case 'chat':
      case 'settlement':
        if (partyId) {
          (navigation as any).navigate('Main', {
            screen: '택시',
            params: { screen: 'Chat', params: { partyId } },
          });
        }
        break;
      case 'kicked':
        (navigation as any).popToTop();
        break;
      case 'party_created':
        (navigation as any).navigate('Main', { screen: '택시' });
        break;
      case 'board_notification':
        if (postId) {
          try {
            (navigation as any).navigate('Main', {
              screen: '커뮤니티',
              params: { screen: 'BoardDetail', params: { postId } },
            });
          } catch {
            (navigation as any).navigate('Main', { screen: '커뮤니티' });
          }
        }
        break;
      case 'notice_notification':
        if (noticeId) {
          (navigation as any).navigate('Main', {
            screen: '공지',
            params: { screen: 'NoticeDetail', params: { noticeId } },
          });
        }
        break;
      case 'app_notice':
        if (noticeId) {
          (navigation as any).navigate('Main', {
            screen: '캠퍼스',
            params: { screen: 'AppNoticeDetail', params: { noticeId } },
          });
        }
        break;
      case 'chat_room_message':
        if (chatRoomId) {
          (navigation as any).navigate('Main', {
            screen: '커뮤니티',
            params: { screen: 'ChatDetail', params: { chatRoomId } },
          });
        }
        break;
    }
    setForegroundNotification(prev => ({ ...prev, visible: false }));
  }, [foregroundNotification, navigation]);

  // 포그라운드 알림 닫기 핸들러
  const handleForegroundNotificationDismiss = useCallback(() => {
    setForegroundNotification(prev => ({ ...prev, visible: false }));
  }, []);

  // 파티 삭제 알림 핸들러 (Alert는 RootNavigator에서 직접 처리)
  const handlePartyDeleted = useCallback(() => {
    // Alert는 RootNavigator에서 처리
  }, []);

  // 공지사항 알림 핸들러
  const handleNoticeReceived = useCallback(
    (noticeId: string, noticeTitle?: string, noticeCategory?: string) => {
      const title = noticeTitle || '새로운 공지사항';
      const category = noticeCategory || '일반';

      setForegroundNotification({
        visible: true,
        title: `📢 새 성결대 ${category} 공지`,
        body: title,
        noticeId,
        type: 'notice',
      });
    },
    []
  );

  // 앱 공지 알림 핸들러
  const handleAppNoticeNotificationReceived = useCallback(
    (data: { appNoticeId: string; title: string }) => {
      setForegroundNotification({
        visible: true,
        title: '새 앱 공지',
        body: data.title,
        noticeId: data.appNoticeId,
        type: 'app_notice',
      });
    },
    []
  );

  // 채팅 메시지 수신 핸들러
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
    []
  );

  // 정산 완료 수신 핸들러
  const handleSettlementCompleted = useCallback((partyId: string) => {
    setForegroundNotification({
      visible: true,
      title: '모든 정산이 완료되었어요',
      body: '동승 파티 종료 준비가 되었습니다.',
      partyId,
      type: 'settlement',
    });
  }, []);

  // 멤버 강퇴 알림 핸들러
  const handleMemberKicked = useCallback(() => {
    setForegroundNotification({
      visible: true,
      title: '파티에서 강퇴되었어요',
      body: '리더가 당신을 파티에서 나가게 했습니다.',
      type: 'kicked',
    });
  }, []);

  // 새 파티 생성 알림 핸들러
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
    []
  );

  // 게시판 알림 핸들러
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
    []
  );

  // 공지사항 알림 핸들러
  const handleNoticeNotificationReceived = useCallback(
    (data: { noticeId: string; type: string; title: string; body: string }) => {
      setForegroundNotification({
        visible: true,
        title: data.title,
        body: data.body,
        noticeId: data.noticeId,
        type: 'notice_notification',
      });
    },
    []
  );

  // 채팅방 메시지 알림 핸들러
  const handleChatRoomMessageReceived = useCallback(
    async (data: { chatRoomId: string; senderName: string; messageText: string }) => {
      try {
        const chatRoomDoc = await getDoc(doc(getFirestore(), 'chatRooms', data.chatRoomId));
        const chatRoomData = chatRoomDoc.data();

        let chatRoomName = '채팅방';
        if (chatRoomData) {
          if (chatRoomData.type === 'university') {
            chatRoomName = '성결대 전체 채팅방';
          } else if (chatRoomData.type === 'department' && authUser?.department) {
            chatRoomName = `${authUser.department} 채팅방`;
          } else {
            chatRoomName = chatRoomData.name || '채팅방';
          }
        }

        setForegroundNotification({
          visible: true,
          title: chatRoomName,
          body: `${data.senderName || '익명'} : ${data.messageText}`,
          chatRoomId: data.chatRoomId,
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
    [authUser?.department]
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

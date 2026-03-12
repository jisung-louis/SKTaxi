// SKTaxi: FCM 포그라운드/백그라운드 메시지 처리 유틸

import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { navigateToBoardDetail } from '@/features/board';

// Messaging 인스턴스
const messaging = getMessaging();

// === 콜백 타입 정의 ===

export interface ForegroundMessageCallbacks {
  showModal: (data: any) => void;
  onPartyDeleted?: () => void;
  onNoticeReceived?: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void;
  onAppNoticeNotificationReceived?: (data: { appNoticeId: string; title: string }) => void;
  onJoinRequestAccepted?: (partyId: string) => void;
  onJoinRequestRejected?: () => void;
  onChatMessageReceived?: (data: { senderName: string; messageText: string; partyId: string }) => void;
  getCurrentScreen?: () => string | undefined;
  onSettlementCompleted?: (partyId: string) => void;
  onMemberKicked?: () => void;
  onPartyCreated?: (data: { partyId: string; title: string; body: string }) => void;
  onBoardNotificationReceived?: (data: { postId: string; type: string; title: string; body: string }) => void;
  onNoticeNotificationReceived?: (data: { noticeId: string; type: string; title: string; body: string }) => void;
  onChatRoomMessageReceived?: (data: { chatRoomId: string; senderName: string; messageText: string }) => void;
  getCurrentChatRoomId?: () => string | undefined;
}

// === 메시지 핸들러 함수들 (개별 타입별 처리) ===

function handleJoinRequest(data: any, callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 동승 요청 메시지 처리');
  callbacks.showModal(data);
}

function handleJoinRequestAccepted(data: any, callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 동승 요청 승인 메시지 처리');
  if (callbacks.onJoinRequestAccepted && data.partyId && typeof data.partyId === 'string') {
    callbacks.onJoinRequestAccepted(data.partyId);
  }
}

function handleJoinRequestRejected(callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 동승 요청 거절 메시지 처리');
  callbacks.onJoinRequestRejected?.();
}

function handlePartyDeleted(callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 파티 삭제 메시지 처리');
  callbacks.onPartyDeleted?.();
}

function handleNotice(data: any, callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 공지사항 메시지 처리:', data.noticeId);
  if (callbacks.onNoticeReceived && data.noticeId && typeof data.noticeId === 'string') {
    const noticeTitle = typeof data.title === 'string' ? data.title : '';
    const noticeCategory = typeof data.category === 'string' ? data.category : '일반';
    callbacks.onNoticeReceived(data.noticeId, noticeTitle, noticeCategory);
  }
}

function handleAppNotice(data: any, callbacks: ForegroundMessageCallbacks) {
  if (callbacks.onAppNoticeNotificationReceived && data.appNoticeId && typeof data.appNoticeId === 'string') {
    const title = typeof data.title === 'string' ? data.title : '새 앱 공지';
    callbacks.onAppNoticeNotificationReceived({ appNoticeId: data.appNoticeId, title });
  }
}

function handleChatMessage(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks
) {
  console.log('🔔 채팅 메시지 처리:', data.partyId);

  // 현재 화면이 Chat이면 알림 숨김
  const currentScreen = callbacks.getCurrentScreen?.();
  if (currentScreen === 'Chat') {
    console.log('🔔 현재 Chat 화면이므로 알림 숨김');
    return;
  }

  if (callbacks.onChatMessageReceived && data.partyId && data.senderId && typeof data.partyId === 'string') {
    const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
    const senderName = title.replace('님의 메시지', '') || '익명';
    const messageText = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
    callbacks.onChatMessageReceived({ senderName, messageText, partyId: data.partyId });
  }
}

function handleChatRoomMessage(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks
) {
  console.log('🔔 채팅방 메시지 처리:', data.chatRoomId);

  // 현재 화면이 ChatDetail이고 같은 채팅방이면 알림 숨김
  const currentScreen = callbacks.getCurrentScreen?.();
  if (currentScreen === 'ChatDetail') {
    const currentChatRoomId = callbacks.getCurrentChatRoomId?.();
    if (currentChatRoomId === data.chatRoomId) {
      console.log('🔔 현재 ChatDetail 화면이고 같은 채팅방이므로 알림 숨김');
      return;
    }
  }

  if (callbacks.onChatRoomMessageReceived && data.chatRoomId && typeof data.chatRoomId === 'string') {
    const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
    const parts = body.split(': ');
    const senderName = parts.length > 1 ? parts[0] : '익명';
    const messageText = parts.length > 1 ? parts.slice(1).join(': ') : body;
    callbacks.onChatRoomMessageReceived({ chatRoomId: data.chatRoomId, senderName, messageText });
  }
}

function handleSettlementCompleted(data: any, callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 정산 완료 알림 처리:', data.partyId);
  if (callbacks.onSettlementCompleted && data.partyId && typeof data.partyId === 'string') {
    callbacks.onSettlementCompleted(data.partyId);
  }
}

function handleMemberKicked(callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 멤버 강퇴 알림 처리');
  callbacks.onMemberKicked?.();
}

function handlePartyCreated(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks
) {
  console.log('🔔 새 파티 생성 알림 처리:', data.partyId);
  if (callbacks.onPartyCreated && data.partyId && typeof data.partyId === 'string') {
    const title = typeof remoteMessage.notification?.title === 'string'
      ? remoteMessage.notification.title
      : '새로운 택시 파티가 등장했어요';
    const body = typeof remoteMessage.notification?.body === 'string'
      ? remoteMessage.notification.body
      : '지금 확인해보세요!';
    callbacks.onPartyCreated({ partyId: data.partyId, title, body });
  }
}

function handleBoardNotification(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks
) {
  console.log('🔔 게시판 알림 처리:', data.type);
  if (callbacks.onBoardNotificationReceived && data.postId && typeof data.postId === 'string') {
    const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
    const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
    callbacks.onBoardNotificationReceived({ postId: data.postId, type: data.type, title, body });
  }
}

function handleNoticeNotification(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks
) {
  console.log('🔔 공지사항 알림 처리:', data.type);
  if (callbacks.onNoticeNotificationReceived && data.noticeId && typeof data.noticeId === 'string') {
    const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
    const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
    callbacks.onNoticeNotificationReceived({ noticeId: data.noticeId, type: data.type, title, body });
  }
}

// === 메인 핸들러 등록 함수 ===

export function initForegroundMessageHandler(
  showModal: (data: any) => void,
  onPartyDeleted?: () => void,
  onNoticeReceived?: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void,
  onAppNoticeNotificationReceived?: (data: { appNoticeId: string; title: string }) => void,
  onJoinRequestAccepted?: (partyId: string) => void,
  onJoinRequestRejected?: () => void,
  onChatMessageReceived?: (data: { senderName: string; messageText: string; partyId: string }) => void,
  getCurrentScreen?: () => string | undefined,
  onSettlementCompleted?: (partyId: string) => void,
  onMemberKicked?: () => void,
  onPartyCreated?: (data: { partyId: string; title: string; body: string }) => void,
  onBoardNotificationReceived?: (data: { postId: string; type: string; title: string; body: string }) => void,
  onNoticeNotificationReceived?: (data: { noticeId: string; type: string; title: string; body: string }) => void,
  onChatRoomMessageReceived?: (data: { chatRoomId: string; senderName: string; messageText: string }) => void,
  getCurrentChatRoomId?: () => string | undefined
) {

  const callbacks: ForegroundMessageCallbacks = {
    showModal,
    onPartyDeleted,
    onNoticeReceived,
    onAppNoticeNotificationReceived,
    onJoinRequestAccepted,
    onJoinRequestRejected,
    onChatMessageReceived,
    getCurrentScreen,
    onSettlementCompleted,
    onMemberKicked,
    onPartyCreated,
    onBoardNotificationReceived,
    onNoticeNotificationReceived,
    onChatRoomMessageReceived,
    getCurrentChatRoomId,
  };

  return onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('🔔 포그라운드에서 FCM 메시지 수신:', JSON.stringify(remoteMessage, null, 2));

    const data = remoteMessage.data || {};
    console.log('🔔 메시지 데이터:', data);

    // 메시지 타입별 핸들러 라우팅
    switch (data.type) {
      case 'join_request':
        handleJoinRequest(data, callbacks);
        break;
      case 'party_join_accepted':
        handleJoinRequestAccepted(data, callbacks);
        break;
      case 'party_join_rejected':
        handleJoinRequestRejected(callbacks);
        break;
      case 'party_deleted':
        handlePartyDeleted(callbacks);
        break;
      case 'notice':
        handleNotice(data, callbacks);
        break;
      case 'app_notice':
        handleAppNotice(data, callbacks);
        break;
      case 'chat_message':
        handleChatMessage(data, remoteMessage, callbacks);
        break;
      case 'chat_room_message':
        handleChatRoomMessage(data, remoteMessage, callbacks);
        break;
      case 'settlement_completed':
        handleSettlementCompleted(data, callbacks);
        break;
      case 'member_kicked':
        handleMemberKicked(callbacks);
        break;
      case 'party_created':
        handlePartyCreated(data, remoteMessage, callbacks);
        break;
      case 'board_post_comment':
      case 'board_comment_reply':
      case 'board_post_like':
        handleBoardNotification(data, remoteMessage, callbacks);
        break;
      case 'notice_post_comment':
      case 'notice_comment_reply':
        handleNoticeNotification(data, remoteMessage, callbacks);
        break;
      default:
        console.log('🔔 알 수 없는 메시지 타입:', data.type);
    }
  });
}

// === 백그라운드/알림 클릭 핸들러 ===

export function initBackgroundMessageHandler(onJoinRequestReceived?: (joinData: any) => void) {
  setBackgroundMessageHandler(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const data = remoteMessage.data || {};
    console.log('백그라운드에서 받은 알림:', data);

    if (data.type === 'notice') {
      console.log('백그라운드 공지사항 알림:', data.noticeId);
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      console.log('백그라운드 동승 요청 알림:', data);
      onJoinRequestReceived(data);
    } else if (data.type === 'party_join_accepted' || data.type === 'party_join_rejected' || data.type === 'party_deleted') {
      console.log('백그라운드 알림:', data.type);
    }
  });
}

// 알림 클릭 시 네비게이션 처리
function handleNotificationNavigation(navigation: any, data: any, onJoinRequestReceived?: (joinData: any) => void) {
  switch (data.type) {
    case 'notice':
      if (data.noticeId) {
        navigation.navigate('공지', { screen: 'NoticeDetail', params: { noticeId: data.noticeId } });
      }
      break;
    case 'app_notice':
      if (data.appNoticeId) {
        navigation.navigate('홈', { screen: 'AppNoticeDetail', params: { noticeId: data.appNoticeId } });
      }
      break;
    case 'join_request':
      if (onJoinRequestReceived) {
        console.log('알림을 통해 동승 요청 수신:', data);
        onJoinRequestReceived(data);
      }
      break;
    case 'party_join_accepted':
      if (data.partyId) {
        navigation.navigate('택시', { screen: 'Chat', params: { partyId: data.partyId } });
      }
      break;
    case 'party_join_rejected':
      navigation.goBack();
      break;
    case 'party_deleted':
      navigation.navigate('택시');
      break;
    case 'chat_message':
    case 'party_closed':
    case 'party_arrived':
      if (data.partyId) {
        navigation.navigate('Main', { screen: '택시', params: { screen: 'Chat', params: { partyId: data.partyId } } });
      }
      break;
    case 'chat_room_message':
      if (data.chatRoomId) {
        navigation.navigate('Main', { screen: '채팅', params: { screen: 'ChatDetail', params: { chatRoomId: data.chatRoomId } } });
      }
      break;
    case 'board_post_comment':
    case 'board_comment_reply':
    case 'board_post_like':
      if (data.postId) {
        navigateToBoardDetail(navigation, data.postId);
      }
      break;
    case 'notice_post_comment':
    case 'notice_comment_reply':
      if (data.noticeId) {
        navigation.navigate('Main', { screen: '공지', params: { screen: 'NoticeDetail', params: { noticeId: data.noticeId } } });
      }
      break;
  }
}

export function initNotificationOpenedAppHandler(navigation: any, onJoinRequestReceived?: (joinData: any) => void) {
  return onNotificationOpenedApp(messaging, remoteMessage => {
    console.log('알림을 통해 앱이 열렸습니다:', remoteMessage);
    const data = remoteMessage.data || {};
    handleNotificationNavigation(navigation, data, onJoinRequestReceived);
  });
}

export async function checkInitialNotification(navigation: any, onJoinRequestReceived?: (joinData: any) => void) {
  const remoteMessage = await getInitialNotification(messaging);

  if (remoteMessage) {
    console.log('앱 종료 상태에서 알림을 통해 앱이 열렸습니다:', remoteMessage);
    const data = remoteMessage.data || {};
    handleNotificationNavigation(navigation, data, onJoinRequestReceived);
  }
}

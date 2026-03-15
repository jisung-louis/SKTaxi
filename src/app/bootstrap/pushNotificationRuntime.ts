import type { FirebaseMessagingTypes } from '@/shared/lib/firebase/messaging';
import {
  getInitialNotificationMessage,
  registerBackgroundMessageHandler,
  subscribeForegroundMessages,
  subscribeNotificationOpenedApp,
} from '@/shared/lib/firebase/messaging';
import { handlePushNotificationNavigation } from '@/app/navigation/services/notificationNavigation';

export interface ForegroundMessageCallbacks {
  showModal: (data: any) => void;
  onPartyDeleted?: () => void;
  onNoticeReceived?: (
    noticeId: string,
    noticeTitle?: string,
    noticeCategory?: string,
  ) => void;
  onAppNoticeNotificationReceived?: (data: {
    appNoticeId: string;
    title: string;
  }) => void;
  onJoinRequestAccepted?: (partyId: string) => void;
  onJoinRequestRejected?: () => void;
  onChatMessageReceived?: (data: {
    senderName: string;
    messageText: string;
    partyId: string;
  }) => void;
  getCurrentScreen?: () => string | undefined;
  onSettlementCompleted?: (partyId: string) => void;
  onMemberKicked?: () => void;
  onPartyCreated?: (data: {
    partyId: string;
    title: string;
    body: string;
  }) => void;
  onBoardNotificationReceived?: (data: {
    postId: string;
    type: string;
    title: string;
    body: string;
  }) => void;
  onNoticeNotificationReceived?: (data: {
    noticeId: string;
    type: string;
    title: string;
    body: string;
  }) => void;
  onChatRoomMessageReceived?: (data: {
    chatRoomId: string;
    senderName: string;
    messageText: string;
  }) => void;
  getCurrentChatRoomId?: () => string | undefined;
}

function handleJoinRequest(data: any, callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 동승 요청 메시지 처리');
  callbacks.showModal(data);
}

function handleJoinRequestAccepted(
  data: any,
  callbacks: ForegroundMessageCallbacks,
) {
  console.log('🔔 동승 요청 승인 메시지 처리');
  if (
    callbacks.onJoinRequestAccepted &&
    data.partyId &&
    typeof data.partyId === 'string'
  ) {
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
  if (
    callbacks.onNoticeReceived &&
    data.noticeId &&
    typeof data.noticeId === 'string'
  ) {
    const noticeTitle = typeof data.title === 'string' ? data.title : '';
    const noticeCategory =
      typeof data.category === 'string' ? data.category : '일반';
    callbacks.onNoticeReceived(data.noticeId, noticeTitle, noticeCategory);
  }
}

function handleAppNotice(data: any, callbacks: ForegroundMessageCallbacks) {
  if (
    callbacks.onAppNoticeNotificationReceived &&
    data.appNoticeId &&
    typeof data.appNoticeId === 'string'
  ) {
    const title = typeof data.title === 'string' ? data.title : '새 앱 공지';
    callbacks.onAppNoticeNotificationReceived({
      appNoticeId: data.appNoticeId,
      title,
    });
  }
}

function handleChatMessage(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks,
) {
  console.log('🔔 채팅 메시지 처리:', data.partyId);

  const currentScreen = callbacks.getCurrentScreen?.();
  if (currentScreen === 'Chat') {
    console.log('🔔 현재 Chat 화면이므로 알림 숨김');
    return;
  }

  if (
    callbacks.onChatMessageReceived &&
    data.partyId &&
    data.senderId &&
    typeof data.partyId === 'string'
  ) {
    const title =
      typeof remoteMessage.notification?.title === 'string'
        ? remoteMessage.notification.title
        : '';
    const senderName = title.replace('님의 메시지', '') || '익명';
    const messageText =
      typeof remoteMessage.notification?.body === 'string'
        ? remoteMessage.notification.body
        : '';
    callbacks.onChatMessageReceived({
      senderName,
      messageText,
      partyId: data.partyId,
    });
  }
}

function handleChatRoomMessage(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks,
) {
  console.log('🔔 채팅방 메시지 처리:', data.chatRoomId);

  const currentScreen = callbacks.getCurrentScreen?.();
  if (currentScreen === 'ChatDetail') {
    const currentChatRoomId = callbacks.getCurrentChatRoomId?.();
    if (currentChatRoomId === data.chatRoomId) {
      console.log('🔔 현재 ChatDetail 화면이고 같은 채팅방이므로 알림 숨김');
      return;
    }
  }

  if (
    callbacks.onChatRoomMessageReceived &&
    data.chatRoomId &&
    typeof data.chatRoomId === 'string'
  ) {
    const body =
      typeof remoteMessage.notification?.body === 'string'
        ? remoteMessage.notification.body
        : '';
    const parts = body.split(': ');
    const senderName = parts.length > 1 ? parts[0] : '익명';
    const messageText = parts.length > 1 ? parts.slice(1).join(': ') : body;
    callbacks.onChatRoomMessageReceived({
      chatRoomId: data.chatRoomId,
      senderName,
      messageText,
    });
  }
}

function handleSettlementCompleted(
  data: any,
  callbacks: ForegroundMessageCallbacks,
) {
  console.log('🔔 정산 완료 메시지 처리');
  if (
    callbacks.onSettlementCompleted &&
    data.partyId &&
    typeof data.partyId === 'string'
  ) {
    callbacks.onSettlementCompleted(data.partyId);
  }
}

function handleMemberKicked(callbacks: ForegroundMessageCallbacks) {
  console.log('🔔 강퇴 메시지 처리');
  callbacks.onMemberKicked?.();
}

function handlePartyCreated(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks,
) {
  console.log('🔔 파티 생성 메시지 처리');
  if (
    callbacks.onPartyCreated &&
    data.partyId &&
    typeof data.partyId === 'string'
  ) {
    callbacks.onPartyCreated({
      partyId: data.partyId,
      title:
        typeof remoteMessage.notification?.title === 'string'
          ? remoteMessage.notification.title
          : '새 택시 파티',
      body:
        typeof remoteMessage.notification?.body === 'string'
          ? remoteMessage.notification.body
          : '새 택시 파티가 생성되었습니다.',
    });
  }
}

function handleBoardNotification(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks,
) {
  if (
    callbacks.onBoardNotificationReceived &&
    data.postId &&
    typeof data.postId === 'string'
  ) {
    callbacks.onBoardNotificationReceived({
      postId: data.postId,
      type: data.type,
      title:
        typeof remoteMessage.notification?.title === 'string'
          ? remoteMessage.notification.title
          : '게시판 알림',
      body:
        typeof remoteMessage.notification?.body === 'string'
          ? remoteMessage.notification.body
          : '새 게시판 알림이 도착했습니다.',
    });
  }
}

function handleNoticeNotification(
  data: any,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  callbacks: ForegroundMessageCallbacks,
) {
  if (
    callbacks.onNoticeNotificationReceived &&
    data.noticeId &&
    typeof data.noticeId === 'string'
  ) {
    callbacks.onNoticeNotificationReceived({
      noticeId: data.noticeId,
      type: data.type,
      title:
        typeof remoteMessage.notification?.title === 'string'
          ? remoteMessage.notification.title
          : '공지 댓글 알림',
      body:
        typeof remoteMessage.notification?.body === 'string'
          ? remoteMessage.notification.body
          : '새 댓글 알림이 도착했습니다.',
    });
  }
}

export function initForegroundMessageHandler(
  showModal: (data: any) => void,
  onPartyDeleted?: () => void,
  onNoticeReceived?: (
    noticeId: string,
    noticeTitle?: string,
    noticeCategory?: string,
  ) => void,
  onAppNoticeNotificationReceived?: (data: {
    appNoticeId: string;
    title: string;
  }) => void,
  onJoinRequestAccepted?: (partyId: string) => void,
  onJoinRequestRejected?: () => void,
  onChatMessageReceived?: (data: {
    senderName: string;
    messageText: string;
    partyId: string;
  }) => void,
  getCurrentScreen?: () => string | undefined,
  onSettlementCompleted?: (partyId: string) => void,
  onMemberKicked?: () => void,
  onPartyCreated?: (data: {
    partyId: string;
    title: string;
    body: string;
  }) => void,
  onBoardNotificationReceived?: (data: {
    postId: string;
    type: string;
    title: string;
    body: string;
  }) => void,
  onNoticeNotificationReceived?: (data: {
    noticeId: string;
    type: string;
    title: string;
    body: string;
  }) => void,
  onChatRoomMessageReceived?: (data: {
    chatRoomId: string;
    senderName: string;
    messageText: string;
  }) => Promise<void>,
  getCurrentChatRoomId?: () => string | undefined,
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

  return subscribeForegroundMessages(async remoteMessage => {
    console.log(
      '🔔 포그라운드에서 FCM 메시지 수신:',
      JSON.stringify(remoteMessage, null, 2),
    );

    const data = remoteMessage.data || {};
    console.log('🔔 메시지 데이터:', data);

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

export function initBackgroundMessageHandler(
  onJoinRequestReceived?: (joinData: any) => void,
) {
  registerBackgroundMessageHandler(async remoteMessage => {
    const data = remoteMessage.data || {};
    console.log('백그라운드에서 받은 알림:', data);

    if (data.type === 'notice') {
      console.log('백그라운드 공지사항 알림:', data.noticeId);
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      console.log('백그라운드 동승 요청 알림:', data);
      onJoinRequestReceived(data);
    } else if (
      data.type === 'party_join_accepted' ||
      data.type === 'party_join_rejected' ||
      data.type === 'party_deleted'
    ) {
      console.log('백그라운드 알림:', data.type);
    }
  });
}

export function initNotificationOpenedAppHandler(
  navigation: any,
  onJoinRequestReceived?: (joinData: any) => void,
) {
  return subscribeNotificationOpenedApp(remoteMessage => {
    console.log('알림을 통해 앱이 열렸습니다:', remoteMessage);
    const data = remoteMessage.data || {};
    handlePushNotificationNavigation({
      navigation,
      data,
      onJoinRequestReceived,
    });
  });
}

export async function checkInitialNotification(
  navigation: any,
  onJoinRequestReceived?: (joinData: any) => void,
) {
  const remoteMessage = await getInitialNotificationMessage();

  if (remoteMessage) {
    console.log('앱 종료 상태에서 알림을 통해 앱이 열렸습니다:', remoteMessage);
    const data = remoteMessage.data || {};
    handlePushNotificationNavigation({
      navigation,
      data,
      onJoinRequestReceived,
    });
  }
}

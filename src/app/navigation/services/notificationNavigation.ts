import {navigateToBoardDetail} from '@/features/board';
import {navigateToNoticeDetail} from '@/features/notice';
import {navigateToAppNoticeDetail} from '@/features/settings';
import type {Notification} from '@/features/user/data/repositories/INotificationRepository';

import {navigateToChatRoom} from './communityNavigation';
import {normalizePushNotificationType} from './normalizePushNotificationType';

type NavigationLike = {
  navigate: (...args: any[]) => void;
  goBack?: () => void;
  popToTop?: () => void;
};

const tryNavigate = (navigate: () => void) => {
  try {
    navigate();
    return true;
  } catch {
    return false;
  }
};

const navigateToTaxiMain = (navigation: NavigationLike) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'TaxiTab',
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('TaxiTab', {
      screen: 'TaxiMain',
    }),
  );
};

const navigateToTaxiChat = (navigation: NavigationLike, partyId: string) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'TaxiTab',
        params: {
          screen: 'Chat',
          params: {partyId},
        },
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('TaxiTab', {
      screen: 'Chat',
      params: {partyId},
    }),
  );
};

const getStringRecordValue = (
  source: Record<string, unknown> | undefined,
  key: string,
) => {
  const value = source?.[key];
  return typeof value === 'string' ? value : null;
};

export const handlePushNotificationNavigation = ({
  navigation,
  data,
  onJoinRequestReceived,
}: {
  navigation: NavigationLike;
  data: Record<string, unknown>;
  onJoinRequestReceived?: (joinData: any) => void;
}) => {
  const noticeId = getStringRecordValue(data, 'noticeId');
  const appNoticeId = getStringRecordValue(data, 'appNoticeId');
  const partyId = getStringRecordValue(data, 'partyId');
  const postId = getStringRecordValue(data, 'postId');
  const chatRoomId = getStringRecordValue(data, 'chatRoomId');
  const type = normalizePushNotificationType(
    getStringRecordValue(data, 'type'),
    data,
  );

  switch (type) {
    case 'notice':
    case 'notice_post_like':
      if (noticeId) {
        navigateToNoticeDetail(navigation, noticeId);
      }
      break;
    case 'app_notice':
      if (appNoticeId) {
        navigateToAppNoticeDetail(navigation, appNoticeId);
      }
      break;
    case 'join_request':
      onJoinRequestReceived?.(data);
      break;
    case 'party_join_accepted':
      if (partyId) {
        navigateToTaxiChat(navigation, partyId);
      }
      break;
    case 'party_join_rejected':
      navigation.goBack?.();
      break;
    case 'party_deleted':
      navigateToTaxiMain(navigation);
      break;
    case 'chat_message':
    case 'party_closed':
    case 'party_arrived':
      if (partyId) {
        navigateToTaxiChat(navigation, partyId);
      }
      break;
    case 'chat_room_message':
      if (chatRoomId) {
        navigateToChatRoom(navigation, chatRoomId);
      }
      break;
    case 'board_post_comment':
    case 'board_comment_reply':
    case 'board_post_like':
      if (postId) {
        navigateToBoardDetail(navigation, postId);
      }
      break;
    case 'notice_post_comment':
    case 'notice_comment_reply':
    case 'notice_post_like':
      if (noticeId) {
        navigateToNoticeDetail(navigation, noticeId);
      }
      break;
  }
};

export const handleForegroundNotificationNavigation = ({
  navigation,
  notification,
}: {
  navigation: NavigationLike;
  notification: {
    type?: string;
    noticeId?: string;
    partyId?: string;
    postId?: string;
    chatRoomId?: string;
  };
}) => {
  const {type, noticeId, partyId, postId, chatRoomId} = notification;

  switch (type) {
    case 'notice':
    case 'notice_notification':
    case 'notice_post_like':
      if (noticeId) {
        navigateToNoticeDetail(navigation, noticeId);
      }
      break;
    case 'chat':
    case 'settlement':
      if (partyId) {
        navigateToTaxiChat(navigation, partyId);
      }
      break;
    case 'kicked':
      navigation.popToTop?.();
      break;
    case 'party_created':
      navigateToTaxiMain(navigation);
      break;
    case 'board_notification':
      if (postId) {
        navigateToBoardDetail(navigation, postId);
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
};

export const handleStoredNotificationNavigation = ({
  navigation,
  notification,
}: {
  navigation: NavigationLike;
  notification: Notification;
}) => {
  const partyId = getStringRecordValue(notification.data, 'partyId');
  const noticeId = getStringRecordValue(notification.data, 'noticeId');
  const appNoticeId = getStringRecordValue(notification.data, 'appNoticeId');
  const postId = getStringRecordValue(notification.data, 'postId');

  switch (notification.type) {
    case 'party_created':
      navigateToTaxiMain(navigation);
      break;
    case 'party_join_request':
    case 'party_join_accepted':
    case 'party_join_rejected':
    case 'party_deleted':
    case 'party_closed':
    case 'party_arrived':
    case 'chat_message':
    case 'settlement_completed':
      if (partyId) {
        navigateToTaxiChat(navigation, partyId);
      } else {
        navigateToTaxiMain(navigation);
      }
      break;
    case 'member_kicked':
      break;
    case 'party_ended':
      navigateToTaxiMain(navigation);
      break;
    case 'notice':
      if (noticeId) {
        navigateToNoticeDetail(navigation, noticeId);
      }
      break;
    case 'app_notice':
      if (appNoticeId) {
        navigateToAppNoticeDetail(navigation, appNoticeId);
      }
      break;
    case 'board_post_comment':
    case 'board_comment_reply':
    case 'board_post_like':
      if (postId) {
        navigateToBoardDetail(navigation, postId);
      }
      break;
    case 'notice_post_comment':
    case 'notice_comment_reply':
    case 'notice_post_like':
      if (noticeId) {
        navigateToNoticeDetail(navigation, noticeId);
      }
      break;
    case 'academic_schedule':
      break;
  }
};

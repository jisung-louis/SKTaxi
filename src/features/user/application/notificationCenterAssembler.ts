import {formatKoreanRelativeTime} from '@/shared/lib/date';

import type {Notification} from '../data/repositories/INotificationRepository';
import type {
  NotificationInboxItemViewData,
  NotificationInboxSectionViewData,
  NotificationInboxViewData,
} from '../model/notificationCenterViewData';

const buildIconMeta = (
  notification: Notification,
): Pick<NotificationInboxItemViewData, 'contextLabel' | 'iconName' | 'iconTone'> => {
  switch (notification.type) {
    case 'app_notice':
      return {
        contextLabel: '앱 공지',
        iconName: 'megaphone-outline',
        iconTone: 'orange',
      };
    case 'notice':
    case 'notice_post_comment':
    case 'notice_post_like':
      return {
        contextLabel: '공지사항',
        iconName:
          notification.type === 'notice_post_like'
            ? 'heart-outline'
            : 'notifications-outline',
        iconTone: 'orange',
      };
    case 'party_join_request':
    case 'party_join_accepted':
    case 'party_join_rejected':
    case 'party_closed':
    case 'party_arrived':
    case 'party_created':
    case 'party_ended':
    case 'settlement_completed':
      return {
        contextLabel: '택시 파티',
        iconName: 'car-sport-outline',
        iconTone: 'yellow',
      };
    case 'chat_message':
      return {
        contextLabel: '택시 채팅',
        iconName: 'chatbubble-outline',
        iconTone: 'green',
      };
    case 'member_kicked':
      return {
        contextLabel: '보안 알림',
        iconName: 'shield-checkmark-outline',
        iconTone: 'purple',
      };
    case 'board_post_like':
      return {
        contextLabel: '커뮤니티',
        iconName: 'heart-outline',
        iconTone: 'orange',
      };
    case 'board_post_comment':
      return {
        contextLabel: '커뮤니티',
        iconName: 'chatbubble-outline',
        iconTone: 'green',
      };
    case 'academic_schedule':
      return {
        contextLabel: '학사 일정',
        iconName: 'calendar-outline',
        iconTone: 'blue',
      };
    default:
      return {
        iconName: 'notifications-outline',
        iconTone: 'blue',
      };
  }
};

export const mapNotificationToInboxItemViewData = (
  notification: Notification,
): NotificationInboxItemViewData => {
  const iconMeta = buildIconMeta(notification);

  return {
    contextLabel: iconMeta.contextLabel,
    iconName: iconMeta.iconName,
    iconTone: iconMeta.iconTone,
    id: notification.id,
    isRead: notification.isRead,
    message: notification.message,
    notification,
    timeLabel: formatKoreanRelativeTime(notification.createdAt),
    title: notification.title,
  };
};

export const buildNotificationCenterViewData = (
  items: NotificationInboxItemViewData[],
): NotificationInboxViewData => {
  const unreadItems = items.filter(item => !item.isRead);
  const readItems = items.filter(item => item.isRead);
  const sections: NotificationInboxSectionViewData[] = [];

  if (unreadItems.length > 0) {
    sections.push({
      id: 'unread',
      items: unreadItems,
    });
  }

  if (readItems.length > 0) {
    sections.push({
      id: 'read',
      items: readItems,
    });
  }

  return {
    sections,
    unreadCount: unreadItems.length,
  };
};

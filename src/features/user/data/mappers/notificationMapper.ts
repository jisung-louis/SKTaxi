import type {
  Notification,
} from '../repositories/INotificationRepository';
import type {
  NotificationDataDto,
  NotificationResponseDto,
  NotificationTypeDto,
} from '../dto/notificationDto';

const pushIfString = (
  target: Record<string, unknown>,
  key: string,
  value?: string | null,
) => {
  if (typeof value === 'string' && value) {
    target[key] = value;
  }
};

const mapNotificationDataDto = (
  data?: NotificationDataDto | null,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  if (!data) {
    return result;
  }

  pushIfString(result, 'academicScheduleId', data.academicScheduleId);
  pushIfString(result, 'appNoticeId', data.appNoticeId);
  pushIfString(result, 'chatRoomId', data.chatRoomId);
  pushIfString(result, 'commentId', data.commentId);
  pushIfString(result, 'noticeId', data.noticeId);
  pushIfString(result, 'partyId', data.partyId);
  pushIfString(result, 'postId', data.postId);
  pushIfString(result, 'requestId', data.requestId);

  return result;
};

const mapNotificationType = (
  type: NotificationTypeDto,
  data?: NotificationDataDto | null,
): string => {
  switch (type) {
    case 'ACADEMIC_SCHEDULE':
      return 'academic_schedule';
    case 'APP_NOTICE':
      return 'app_notice';
    case 'CHAT_MESSAGE':
      return 'chat_message';
    case 'COMMENT_CREATED':
      if (data?.noticeId) {
        return 'notice_post_comment';
      }

      return 'board_post_comment';
    case 'MEMBER_KICKED':
      return 'member_kicked';
    case 'NOTICE':
      return 'notice';
    case 'PARTY_ARRIVED':
      return 'party_arrived';
    case 'PARTY_CLOSED':
      return 'party_closed';
    case 'PARTY_CREATED':
      return 'party_created';
    case 'PARTY_ENDED':
      return 'party_ended';
    case 'PARTY_REOPENED':
      return 'party_reopened';
    case 'PARTY_JOIN_ACCEPTED':
      return 'party_join_accepted';
    case 'PARTY_JOIN_DECLINED':
      return 'party_join_rejected';
    case 'PARTY_JOIN_REQUEST':
      return 'party_join_request';
    case 'POST_LIKED':
      if (data?.noticeId) {
        return 'notice_post_like';
      }

      return 'board_post_like';
    case 'SETTLEMENT_COMPLETED':
      return 'settlement_completed';
    default:
      return String(type).toLowerCase();
  }
};

export const mapNotificationResponseDto = (
  notification: NotificationResponseDto,
): Notification => {
  return {
    createdAt: new Date(notification.createdAt),
    data: mapNotificationDataDto(notification.data),
    id: notification.id,
    isRead: Boolean(notification.isRead),
    message: notification.message,
    title: notification.title,
    type: mapNotificationType(notification.type, notification.data),
  };
};

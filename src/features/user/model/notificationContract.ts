export type NotificationType =
  | 'ACADEMIC_SCHEDULE'
  | 'APP_NOTICE'
  | 'CHAT_MESSAGE'
  | 'COMMENT_CREATED'
  | 'MEMBER_KICKED'
  | 'NOTICE'
  | 'PARTY_ARRIVED'
  | 'PARTY_CLOSED'
  | 'PARTY_CREATED'
  | 'PARTY_ENDED'
  | 'PARTY_REOPENED'
  | 'PARTY_JOIN_ACCEPTED'
  | 'PARTY_JOIN_DECLINED'
  | 'PARTY_JOIN_REQUEST'
  | 'POST_LIKED'
  | 'SETTLEMENT_COMPLETED';

export interface NotificationData {
  academicScheduleId?: string;
  appNoticeId?: string;
  chatRoomId?: string;
  commentId?: string;
  noticeId?: string;
  partyId?: string;
  postId?: string;
  requestId?: string;
}

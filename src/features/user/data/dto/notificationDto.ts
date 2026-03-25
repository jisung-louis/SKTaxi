export type NotificationTypeDto =
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

export interface NotificationDataDto {
  academicScheduleId?: string | null;
  appNoticeId?: string | null;
  chatRoomId?: string | null;
  commentId?: string | null;
  noticeId?: string | null;
  partyId?: string | null;
  postId?: string | null;
  requestId?: string | null;
}

export interface NotificationResponseDto {
  createdAt: string;
  data?: NotificationDataDto | null;
  id: string;
  isRead: boolean;
  message: string;
  title: string;
  type: NotificationTypeDto;
}

export interface NotificationListResponseDto {
  content: NotificationResponseDto[];
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationUnreadCountResponseDto {
  count: number;
}

export interface NotificationSnapshotResponseDto {
  unreadCount: number;
}

import type { UserAccountInfo } from '@/shared/types/user';

export interface MemberNotificationSetting {
  allNotifications: boolean;
  partyNotifications: boolean;
  noticeNotifications: boolean;
  boardLikeNotifications: boolean;
  commentNotifications: boolean;
  bookmarkedPostCommentNotifications: boolean;
  systemNotifications: boolean;
  academicScheduleNotifications: boolean;
  academicScheduleDayBeforeEnabled: boolean;
  academicScheduleAllEventsEnabled: boolean;
  noticeNotificationsDetail: Record<string, boolean>;
}

export interface MemberProfile {
  id: string;
  email: string;
  nickname: string;
  studentId: string | null;
  department: string | null;
  realname: string | null;
  photoUrl: string | null;
  isAdmin: boolean;
  bankAccount: UserAccountInfo | null;
  notificationSetting: MemberNotificationSetting | null;
  joinedAt: string;
  lastLogin: string | null;
}

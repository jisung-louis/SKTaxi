export interface UpdateMemberNotificationSettingsRequestDto {
  allNotifications?: boolean;
  partyNotifications?: boolean;
  noticeNotifications?: boolean;
  boardLikeNotifications?: boolean;
  commentNotifications?: boolean;
  bookmarkedPostCommentNotifications?: boolean;
  systemNotifications?: boolean;
  academicScheduleNotifications?: boolean;
  academicScheduleDayBeforeEnabled?: boolean;
  academicScheduleAllEventsEnabled?: boolean;
  noticeNotificationsDetail?: Record<string, boolean>;
}

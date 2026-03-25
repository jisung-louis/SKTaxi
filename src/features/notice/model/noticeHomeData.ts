export interface NoticeHomeSourceItem {
  category: string;
  id: string;
  isRead: boolean;
  postedAt: string;
  title: string;
}

export interface NoticeHomeUnreadSummary {
  firstUnreadNoticeId?: string;
  unreadCount: number;
}

export interface NoticeHomePageResult extends NoticeHomeUnreadSummary {
  items: NoticeHomeSourceItem[];
  nextCursor?: string;
}

export interface NoticeHomeSettings {
  noticeNotifications: boolean;
  noticeNotificationsDetail: Record<string, boolean>;
}

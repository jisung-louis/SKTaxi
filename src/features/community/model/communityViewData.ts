export type CommunitySegmentId = 'board' | 'chat';

export interface CommunityBoardFeaturedViewData {
  categoryLabel: string;
  commentCount: number;
  id: string;
  likeCount: number;
  timeLabel: string;
  title: string;
}

export interface CommunityBoardPostViewData {
  authorLabel: string;
  bookmarkCount: number;
  categoryLabel: string;
  commentCount: number;
  excerpt: string;
  id: string;
  likeCount: number;
  timeLabel: string;
  title: string;
}

export interface CommunityChatRoomViewData {
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  id: string;
  memberCountLabel: string;
  timeLabel: string;
  title: string;
  unreadCount: number;
  subtitle: string;
}

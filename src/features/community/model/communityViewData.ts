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
  description: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  id: string;
  isJoined: boolean;
  memberCountLabel: string;
  previewLabel: string;
  statusBackgroundColor: string;
  statusLabel: string;
  statusTextColor: string;
  timeLabel: string;
  title: string;
  unreadCount: number;
}

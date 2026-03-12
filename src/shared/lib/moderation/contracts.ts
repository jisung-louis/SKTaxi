export type ReportTargetType = 'post' | 'comment' | 'chat_message' | 'profile';

export type ReportCategory =
  | '스팸'
  | '욕설/혐오'
  | '불법/위험'
  | '음란물'
  | '기타';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'rejected';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorId: string;
  category: ReportCategory;
  reasonText?: string;
  screenshotUrls?: string[];
}

export interface ReportDoc extends ReportPayload {
  reporterId: string;
  status: ReportStatus;
  createdAt: any;
  updatedAt: any;
}

export interface BlockedUser {
  blockedUserId: string;
  blockedBy: string;
  createdAt: any;
}

export interface IModerationRepository {
  createReport(reporterId: string, payload: ReportPayload): Promise<string>;
  blockUser(blockerId: string, blockedUserId: string): Promise<void>;
  unblockUser(blockerId: string, blockedUserId: string): Promise<void>;
  isBlocked(viewerId: string, authorId: string): Promise<boolean>;
  isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean>;
  countOpenReports(): Promise<number>;
}

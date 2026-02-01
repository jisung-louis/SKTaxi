// SKTaxi: 신고/차단 관리 Repository 인터페이스
// Firebase Firestore 직접 의존 제거

export type ReportTargetType = 'post' | 'comment' | 'chat_message' | 'profile';

export type ReportCategory = '스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'rejected';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string; // postId, commentId, messageId 등
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
  /**
   * 신고를 생성합니다
   * @param reporterId - 신고자 ID
   * @param payload - 신고 내용
   * @returns 생성된 신고 문서 ID
   */
  createReport(reporterId: string, payload: ReportPayload): Promise<string>;

  /**
   * 사용자를 차단합니다
   * @param blockerId - 차단하는 사용자 ID
   * @param blockedUserId - 차단할 사용자 ID
   */
  blockUser(blockerId: string, blockedUserId: string): Promise<void>;

  /**
   * 사용자 차단을 해제합니다
   * @param blockerId - 차단을 해제하는 사용자 ID
   * @param blockedUserId - 차단 해제할 사용자 ID
   */
  unblockUser(blockerId: string, blockedUserId: string): Promise<void>;

  /**
   * 특정 사용자가 다른 사용자를 차단했는지 확인합니다
   * @param viewerId - 조회하는 사용자 ID
   * @param authorId - 확인할 대상 사용자 ID
   */
  isBlocked(viewerId: string, authorId: string): Promise<boolean>;

  /**
   * 상호 차단(양방향) 여부를 확인합니다
   * @param viewerId - 조회하는 사용자 ID
   * @param authorId - 확인할 대상 사용자 ID
   */
  isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean>;

  /**
   * 열려있는 신고 수를 카운트합니다 (관리자용)
   */
  countOpenReports(): Promise<number>;
}

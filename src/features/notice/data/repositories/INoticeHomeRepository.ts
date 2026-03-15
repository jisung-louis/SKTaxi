import type {
  NoticeHomePageResult,
  NoticeHomeSettings,
  NoticeHomeUnreadSummary,
} from '../../model/noticeHomeData';

export interface GetNoticeHomePageParams {
  categories?: string[];
  cursor?: string;
  limit: number;
}

export interface INoticeHomeRepository {
  getNoticePage(params: GetNoticeHomePageParams): Promise<NoticeHomePageResult>;
  getNoticeSettings(): Promise<NoticeHomeSettings>;
  getUnreadSummary(categories?: string[]): Promise<NoticeHomeUnreadSummary>;
  markNoticeAsRead(noticeId: string): Promise<void>;
  updateNoticeDetail(
    categoryKey: string,
    enabled: boolean,
  ): Promise<NoticeHomeSettings>;
  updateNoticeMaster(enabled: boolean): Promise<NoticeHomeSettings>;
}

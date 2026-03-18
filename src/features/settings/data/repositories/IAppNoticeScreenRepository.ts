import type {AppNoticeRecord} from '../../model/appNoticeSource';

export interface IAppNoticeScreenRepository {
  getNotice(noticeId: string): Promise<AppNoticeRecord | null>;
  getNotices(): Promise<AppNoticeRecord[]>;
}

import type {NoticeDetailSourceItem} from '../../model/noticeDetailData';

export interface INoticeDetailRepository {
  getNoticeDetail(noticeId: string): Promise<NoticeDetailSourceItem | null>;
}

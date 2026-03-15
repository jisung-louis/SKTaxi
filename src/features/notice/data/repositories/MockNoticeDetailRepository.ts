import type {INoticeDetailRepository} from './INoticeDetailRepository';
import type {NoticeDetailSourceItem} from '../../model/noticeDetailData';
import {NOTICE_DETAIL_MOCK} from '../../mocks/noticeDetail.mock';

const MOCK_DELAY_MS = 180;

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export class MockNoticeDetailRepository implements INoticeDetailRepository {
  async getNoticeDetail(
    noticeId: string,
  ): Promise<NoticeDetailSourceItem | null> {
    await delay(MOCK_DELAY_MS);

    return (
      NOTICE_DETAIL_MOCK.find(notice => notice.id === noticeId) ?? null
    );
  }
}

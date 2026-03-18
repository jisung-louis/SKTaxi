import type {IAppNoticeScreenRepository} from './IAppNoticeScreenRepository';
import {APP_NOTICE_RECORDS_MOCK} from '../../mocks/appNotice.mock';
import type {AppNoticeRecord} from '../../model/appNoticeSource';

const cloneRecord = (record: AppNoticeRecord): AppNoticeRecord => ({
  ...record,
  bodyParagraphs: [...record.bodyParagraphs],
  galleryImages: [...record.galleryImages],
});

export class MockAppNoticeScreenRepository
  implements IAppNoticeScreenRepository
{
  async getNotice(noticeId: string): Promise<AppNoticeRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 160));

    const record = APP_NOTICE_RECORDS_MOCK.find(item => item.id === noticeId);
    return record ? cloneRecord(record) : null;
  }

  async getNotices(): Promise<AppNoticeRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 180));
    return APP_NOTICE_RECORDS_MOCK.map(cloneRecord);
  }
}

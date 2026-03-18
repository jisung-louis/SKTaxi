import type { SubscriptionCallbacks, Unsubscribe } from '@/shared/types/subscription';

import type {
  AppNotice,
  IAppNoticeRepository,
} from './IAppNoticeRepository';
import { APP_NOTICE_RECORDS_MOCK } from '../../mocks/appNotice.mock';

const notices: AppNotice[] = APP_NOTICE_RECORDS_MOCK.map((record, index) => ({
  id: record.id,
  title: record.title,
  content: record.bodyParagraphs.join('\n\n'),
  category: index === 0 ? 'update' : index === 1 ? 'service' : 'policy',
  priority: record.important ? 'urgent' : 'normal',
  publishedAt: new Date(Date.now() - index * 1000 * 60 * 60 * 12),
  imageUrls: record.galleryImages.map(image => String(image)),
}));

const emit = <T,>(callbacks: SubscriptionCallbacks<T>, value: T) => {
  setTimeout(() => callbacks.onData(value), 0);
};

export class MockAppNoticeRepository implements IAppNoticeRepository {
  async getAppNotices(): Promise<AppNotice[]> {
    return notices.map(notice => ({ ...notice, imageUrls: [...(notice.imageUrls ?? [])] }));
  }

  async getAppNotice(noticeId: string): Promise<AppNotice | null> {
    const notice = notices.find(item => item.id === noticeId);
    return notice
      ? { ...notice, imageUrls: [...(notice.imageUrls ?? [])] }
      : null;
  }

  subscribeToAppNotices(callbacks: SubscriptionCallbacks<AppNotice[]>): Unsubscribe {
    emit(callbacks, notices.map(notice => ({ ...notice, imageUrls: [...(notice.imageUrls ?? [])] })));
    return () => {};
  }

  subscribeToAppNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<AppNotice | null>,
  ): Unsubscribe {
    this.getAppNotice(noticeId).then(notice => emit(callbacks, notice));
    return () => {};
  }
}

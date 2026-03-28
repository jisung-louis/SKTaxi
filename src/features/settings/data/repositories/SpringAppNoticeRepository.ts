import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import {appNoticeApiClient} from '../api/appNoticeApiClient';
import {mapAppNoticeResponseDto} from '../mappers/appNoticeMapper';
import type {
  AppNotice,
  AppNoticeReadState,
  IAppNoticeRepository,
} from './IAppNoticeRepository';

export class SpringAppNoticeRepository implements IAppNoticeRepository {
  async getUnreadCount(): Promise<number> {
    const response = await appNoticeApiClient.getUnreadCount();
    return response.data.count;
  }

  async getAppNotice(noticeId: string): Promise<AppNotice | null> {
    try {
      const response = await appNoticeApiClient.getAppNotice(noticeId);
      return mapAppNoticeResponseDto(response.data);
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async getAppNotices(): Promise<AppNotice[]> {
    const response = await appNoticeApiClient.getAppNotices();
    return response.data.map(mapAppNoticeResponseDto);
  }

  async markAsRead(noticeId: string): Promise<AppNoticeReadState> {
    const response = await appNoticeApiClient.markAsRead(noticeId);

    return {
      appNoticeId: response.data.appNoticeId,
      isRead: response.data.isRead,
      readAt: new Date(response.data.readAt),
    };
  }

  subscribeToAppNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<AppNotice | null>,
  ): Unsubscribe {
    this.getAppNotice(noticeId)
      .then(notice => callbacks.onData(notice))
      .catch(error => callbacks.onError(error as Error));

    return () => {};
  }

  subscribeToAppNotices(
    callbacks: SubscriptionCallbacks<AppNotice[]>,
  ): Unsubscribe {
    this.getAppNotices()
      .then(notices => callbacks.onData(notices))
      .catch(error => callbacks.onError(error as Error));

    return () => {};
  }
}

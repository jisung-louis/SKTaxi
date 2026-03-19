import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {RepositoryErrorCode} from '@/shared/lib/errors';

import {appNoticeApiClient} from '../api/appNoticeApiClient';
import {mapAppNoticeResponseDto} from '../mappers/appNoticeMapper';
import type {AppNotice, IAppNoticeRepository} from './IAppNoticeRepository';

export class SpringAppNoticeRepository implements IAppNoticeRepository {
  async getAppNotice(noticeId: string): Promise<AppNotice | null> {
    try {
      const response = await appNoticeApiClient.getAppNotice(noticeId);
      return mapAppNoticeResponseDto(response.data);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
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

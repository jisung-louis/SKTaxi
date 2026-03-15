import {
  NOTICE_HOME_ITEMS_MOCK,
  NOTICE_HOME_SETTINGS_MOCK,
} from '../../mocks/noticeHome.mock';
import type {
  NoticeHomePageResult,
  NoticeHomeSettings,
  NoticeHomeSourceItem,
  NoticeHomeUnreadSummary,
} from '../../model/noticeHomeData';
import type {
  GetNoticeHomePageParams,
  INoticeHomeRepository,
} from './INoticeHomeRepository';

const NETWORK_DELAY_MS = 180;

let noticeItemsState = [...NOTICE_HOME_ITEMS_MOCK];
let noticeSettingsState: NoticeHomeSettings = {
  ...NOTICE_HOME_SETTINGS_MOCK,
  noticeNotificationsDetail: {
    ...NOTICE_HOME_SETTINGS_MOCK.noticeNotificationsDetail,
  },
};

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
};

const sortItems = (items: NoticeHomeSourceItem[]) => {
  return [...items].sort(
    (left, right) =>
      new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
};

const filterItems = (categories?: string[]) => {
  if (!categories?.length) {
    return sortItems(noticeItemsState);
  }

  return sortItems(
    noticeItemsState.filter(item => categories.includes(item.category)),
  );
};

const buildUnreadSummary = (
  items: NoticeHomeSourceItem[],
): NoticeHomeUnreadSummary => {
  const unreadItems = items.filter(item => !item.isRead);

  return {
    firstUnreadNoticeId: unreadItems[0]?.id,
    unreadCount: unreadItems.length,
  };
};

const cloneSettings = (): NoticeHomeSettings => ({
  noticeNotifications: noticeSettingsState.noticeNotifications,
  noticeNotificationsDetail: {
    ...noticeSettingsState.noticeNotificationsDetail,
  },
});

export class MockNoticeHomeRepository implements INoticeHomeRepository {
  async getNoticePage({
    categories,
    cursor,
    limit,
  }: GetNoticeHomePageParams): Promise<NoticeHomePageResult> {
    await wait();

    const filteredItems = filterItems(categories);
    const offset = cursor ? Number(cursor) : 0;
    const pageItems = filteredItems.slice(offset, offset + limit);
    const nextOffset = offset + limit;

    return {
      ...buildUnreadSummary(filteredItems),
      items: pageItems,
      nextCursor:
        nextOffset < filteredItems.length ? String(nextOffset) : undefined,
    };
  }

  async getNoticeSettings(): Promise<NoticeHomeSettings> {
    await wait();
    return cloneSettings();
  }

  async getUnreadSummary(
    categories?: string[],
  ): Promise<NoticeHomeUnreadSummary> {
    await wait();
    return buildUnreadSummary(filterItems(categories));
  }

  async markNoticeAsRead(noticeId: string): Promise<void> {
    await wait();
    noticeItemsState = noticeItemsState.map(item =>
      item.id === noticeId ? {...item, isRead: true} : item,
    );
  }

  async updateNoticeDetail(
    categoryKey: string,
    enabled: boolean,
  ): Promise<NoticeHomeSettings> {
    await wait();
    noticeSettingsState = {
      ...noticeSettingsState,
      noticeNotificationsDetail: {
        ...noticeSettingsState.noticeNotificationsDetail,
        [categoryKey]: enabled,
      },
    };
    return cloneSettings();
  }

  async updateNoticeMaster(enabled: boolean): Promise<NoticeHomeSettings> {
    await wait();
    noticeSettingsState = {
      ...noticeSettingsState,
      noticeNotifications: enabled,
    };
    return cloneSettings();
  }
}

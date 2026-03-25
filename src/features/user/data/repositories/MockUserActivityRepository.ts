import {
  BOOKMARKS_MOCK,
  MY_POSTS_MOCK,
  TAXI_HISTORY_MOCK,
} from '../../mocks/userActivity.mock';
import type {
  BookmarksSource,
  TaxiHistorySource,
  UserPostListItemSource,
} from '../../model/userActivitySource';

import type {IUserActivityRepository} from './IUserActivityRepository';

const MOCK_DELAY_MS = 120;

export class MockUserActivityRepository implements IUserActivityRepository {
  async getBookmarks(): Promise<BookmarksSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return BOOKMARKS_MOCK;
  }

  async getMyPosts(): Promise<UserPostListItemSource[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return MY_POSTS_MOCK;
  }

  async getTaxiHistory(): Promise<TaxiHistorySource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return TAXI_HISTORY_MOCK;
  }
}

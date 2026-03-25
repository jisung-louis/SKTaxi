import type {
  BookmarksSource,
  TaxiHistorySource,
  UserPostListItemSource,
} from '../../model/userActivitySource';

export interface IUserActivityRepository {
  getBookmarks(): Promise<BookmarksSource>;
  getMyPosts(): Promise<UserPostListItemSource[]>;
  getTaxiHistory(): Promise<TaxiHistorySource>;
}

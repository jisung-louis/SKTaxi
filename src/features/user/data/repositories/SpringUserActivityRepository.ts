import {format} from 'date-fns';

import type {BoardPostSummaryDto} from '@/features/board/data/dto/boardDto';

import {
  memberBoardApiClient,
  MemberBoardApiClient,
} from '../api/memberBoardApiClient';
import {BOOKMARKS_MOCK, TAXI_HISTORY_MOCK} from '../../mocks/userActivity.mock';
import type {
  BookmarksSource,
  TaxiHistorySource,
  UserPostListItemSource,
  UserPostTone,
} from '../../model/userActivitySource';
import type {IUserActivityRepository} from './IUserActivityRepository';

const MY_POSTS_PAGE_SIZE = 50;

const CATEGORY_LABELS: Record<string, string> = {
  ANNOUNCEMENT: '정보게시판',
  GENERAL: '자유게시판',
  QUESTION: '질문게시판',
  REVIEW: '후기게시판',
};

const CATEGORY_TONES: Record<string, UserPostTone> = {
  ANNOUNCEMENT: 'green',
  GENERAL: 'blue',
  QUESTION: 'orange',
  REVIEW: 'orange',
};

const summarizeContent = (content: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 72) {
    return normalized;
  }

  return `${normalized.slice(0, 69).trimEnd()}...`;
};

const mapBoardPostToUserPostItem = (
  post: BoardPostSummaryDto,
): UserPostListItemSource => ({
  bookmarkCount: post.bookmarkCount,
  categoryLabel: CATEGORY_LABELS[post.category] ?? '자유게시판',
  categoryTone: CATEGORY_TONES[post.category] ?? 'blue',
  commentCount: post.commentCount,
  dateLabel: format(new Date(post.createdAt), 'M.d'),
  excerpt: summarizeContent(post.content),
  likeCount: post.likeCount,
  postId: post.id,
  title: post.title,
});

export class SpringUserActivityRepository implements IUserActivityRepository {
  constructor(
    private readonly apiClient: MemberBoardApiClient = memberBoardApiClient,
  ) {}

  async getBookmarks(): Promise<BookmarksSource> {
    return BOOKMARKS_MOCK;
  }

  async getMyPosts(): Promise<UserPostListItemSource[]> {
    const items: UserPostListItemSource[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await this.apiClient.getMyPosts({
        page,
        size: MY_POSTS_PAGE_SIZE,
      });
      const nextPage = response.data;

      items.push(...nextPage.content.map(mapBoardPostToUserPostItem));
      hasNext = nextPage.hasNext;
      page += 1;
    }

    return items;
  }

  async getTaxiHistory(): Promise<TaxiHistorySource> {
    return TAXI_HISTORY_MOCK;
  }
}

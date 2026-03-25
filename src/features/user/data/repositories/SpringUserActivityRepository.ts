import {format} from 'date-fns';

import type {BoardPostSummaryDto} from '@/features/board/data/dto/boardDto';
import {
  noticeApiClient,
  NoticeApiClient,
} from '@/features/notice/data/api/noticeApiClient';
import type {NoticeBookmarkSummaryDto} from '@/features/notice/data/dto/noticeDto';

import {
  memberBoardApiClient,
  MemberBoardApiClient,
} from '../api/memberBoardApiClient';
import {TAXI_HISTORY_MOCK} from '../../mocks/userActivity.mock';
import type {
  BookmarksSource,
  TaxiHistorySource,
  UserNoticeBookmarkItemSource,
  UserPostListItemSource,
  UserPostTone,
} from '../../model/userActivitySource';
import type {IUserActivityRepository} from './IUserActivityRepository';

const MY_POSTS_PAGE_SIZE = 50;
const NOTICE_BOOKMARKS_PAGE_SIZE = 50;

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

const NOTICE_CATEGORY_LABELS: Record<string, string> = {
  '공모/행사': '행사',
  '장학/등록/학자금': '장학',
};

const NOTICE_CATEGORY_TONES: Record<
  string,
  UserNoticeBookmarkItemSource['categoryTone']
> = {
  행사: 'pink',
  장학: 'yellow',
  학사: 'blue',
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

const mapNoticeBookmarkToItem = (
  notice: NoticeBookmarkSummaryDto,
): UserNoticeBookmarkItemSource => {
  const categoryLabel =
    NOTICE_CATEGORY_LABELS[notice.category] ?? notice.category;

  return {
    categoryLabel,
    categoryTone: NOTICE_CATEGORY_TONES[categoryLabel] ?? 'blue',
    dateLabel: format(new Date(notice.postedAt), 'yyyy-MM-dd'),
    excerpt: summarizeContent(notice.rssPreview),
    noticeId: notice.id,
    title: notice.title,
  };
};

export class SpringUserActivityRepository implements IUserActivityRepository {
  constructor(
    private readonly apiClient: MemberBoardApiClient = memberBoardApiClient,
    private readonly noticeClient: NoticeApiClient = noticeApiClient,
  ) {}

  async getBookmarks(): Promise<BookmarksSource> {
    const [communityItems, noticeItems] = await Promise.all([
      this.getAllCommunityBookmarks(),
      this.getAllNoticeBookmarks(),
    ]);

    return {
      communityItems,
      noticeItems,
    };
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

  private async getAllCommunityBookmarks(): Promise<UserPostListItemSource[]> {
    const items: UserPostListItemSource[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await this.apiClient.getMyBookmarks({
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

  private async getAllNoticeBookmarks(): Promise<
    UserNoticeBookmarkItemSource[]
  > {
    const items: UserNoticeBookmarkItemSource[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await this.noticeClient.getMyNoticeBookmarks({
        page,
        size: NOTICE_BOOKMARKS_PAGE_SIZE,
      });
      const nextPage = response.data;

      items.push(...nextPage.content.map(mapNoticeBookmarkToItem));
      hasNext = nextPage.hasNext;
      page += 1;
    }

    return items;
  }
}

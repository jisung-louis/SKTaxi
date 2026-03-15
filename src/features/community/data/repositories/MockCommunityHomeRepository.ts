import {
  COMMUNITY_BOARD_POSTS_MOCK,
  COMMUNITY_CHAT_ROOMS_MOCK,
} from '../../mocks/communityHome.mock';
import type {
  CommunityBoardPageResult,
  CommunityBoardSearchFilters,
  CommunityBoardSourceItem,
  CommunityChatRoomSourceItem,
} from '../../model/communityHomeData';
import type {
  GetCommunityBoardPostsParams,
  ICommunityHomeRepository,
} from './ICommunityHomeRepository';

const NETWORK_DELAY_MS = 180;

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
};

const getPostPopularityScore = (post: CommunityBoardSourceItem) => {
  return post.likeCount * 2 + post.commentCount * 3 + post.bookmarkCount * 4;
};

const matchesSearch = (post: CommunityBoardSourceItem, searchText?: string) => {
  if (!searchText) {
    return true;
  }

  const normalizedQuery = searchText.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  if (normalizedQuery.startsWith('#')) {
    const hashtagQuery = normalizedQuery.slice(1);
    return post.hashtags.some(
      hashtag => hashtag.toLowerCase() === hashtagQuery,
    );
  }

  const haystack = [post.title, post.content, ...post.hashtags]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalizedQuery);
};

const sortBoardPosts = (
  items: CommunityBoardSourceItem[],
  sortBy: CommunityBoardSearchFilters['sortBy'],
) => {
  return [...items].sort((left, right) => {
    if (sortBy === 'popular') {
      return getPostPopularityScore(right) - getPostPopularityScore(left);
    }

    if (sortBy === 'mostCommented') {
      return right.commentCount - left.commentCount;
    }

    if (sortBy === 'mostViewed') {
      return right.viewCount - left.viewCount;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
};

export class MockCommunityHomeRepository implements ICommunityHomeRepository {
  async getBoardPosts({
    cursor,
    filters,
    limit,
  }: GetCommunityBoardPostsParams): Promise<CommunityBoardPageResult> {
    await wait();

    const filtered = COMMUNITY_BOARD_POSTS_MOCK.filter(post => {
      if (filters.category && post.category !== filters.category) {
        return false;
      }

      return matchesSearch(post, filters.searchText);
    });

    const sorted = sortBoardPosts(filtered, filters.sortBy);
    const offset = cursor ? Number(cursor) : 0;
    const pageItems = sorted.slice(offset, offset + limit);
    const nextOffset = offset + limit;

    return {
      featuredPost: sortBoardPosts(COMMUNITY_BOARD_POSTS_MOCK, 'popular')[0],
      items: pageItems,
      nextCursor: nextOffset < sorted.length ? String(nextOffset) : undefined,
    };
  }

  async getChatRooms(): Promise<CommunityChatRoomSourceItem[]> {
    await wait();
    return [...COMMUNITY_CHAT_ROOMS_MOCK];
  }
}

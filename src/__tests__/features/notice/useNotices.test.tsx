import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Notice } from '../../../features/notice';
import { MockNoticeRepository } from '../../../features/notice/testing/MockNoticeRepository';
import { useNotices } from '../../../features/notice/hooks/useNotices';

const mockUseNoticeReadState = jest.fn();
const mockUseNoticeRepository = jest.fn();

jest.mock('../../../features/notice/hooks/useNoticeReadState', () => ({
  useNoticeReadState: (params: { notices: Notice[] }) => mockUseNoticeReadState(params),
}));

jest.mock('../../../features/notice/hooks/useNoticeRepository', () => ({
  useNoticeRepository: () => mockUseNoticeRepository(),
}));

function createMockNotice(index: number): Notice {
  const createdAt = new Date(Date.UTC(2026, 0, index, 9, 0, 0));

  return {
    id: `notice-${index}`,
    title: `공지 ${index}`,
    content: `공지 ${index} 요약`,
    link: '',
    postedAt: createdAt,
    category: '일반',
    createdAt: createdAt.toISOString(),
    author: '관리자',
    department: '학생지원팀',
    source: 'notice',
    contentDetail: `공지 ${index} 상세`,
    contentAttachments: [],
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  };
}

describe('useNotices', () => {
  let repository: MockNoticeRepository;

  beforeEach(() => {
    repository = new MockNoticeRepository();
    repository.clearMockData();

    Array.from({ length: 25 }, (_, index) => createMockNotice(index + 1)).forEach((notice) => {
      repository.addMockNotice(notice);
    });

    mockUseNoticeRepository.mockReturnValue(repository);
    mockUseNoticeReadState.mockReturnValue({
      readStatus: {},
      readStatusLoading: false,
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refreshReadStatus: jest.fn(),
      userJoinedAt: null,
      userJoinedAtLoaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('초기 구독에서 받은 cursor로 다음 페이지를 이어서 불러온다', async () => {
    const { result } = renderHook(() => useNotices('전체'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notices).toHaveLength(20);
    expect(result.current.notices[0].id).toBe('notice-25');
    expect(result.current.notices[19].id).toBe('notice-6');
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(result.current.notices).toHaveLength(25);
    expect(result.current.notices.slice(-5).map((notice) => notice.id)).toEqual([
      'notice-5',
      'notice-4',
      'notice-3',
      'notice-2',
      'notice-1',
    ]);
    expect(result.current.hasMore).toBe(false);
  });
});

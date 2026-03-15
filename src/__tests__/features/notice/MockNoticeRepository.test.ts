import type { Notice, NoticeListPage } from '../../../features/notice';
import { MockNoticeRepository } from '../../../features/notice/testing/MockNoticeRepository';
import {
  createMockSubscriptionCallbacks,
  waitFor as waitForMs,
} from '../../__mocks__/firebase';

function createMockNotice(index: number): Notice {
  const createdAt = new Date(Date.UTC(2026, 1, index, 9, 0, 0));

  return {
    id: `notice-${index}`,
    title: `학교 공지 ${index}`,
    content: `학교 공지 ${index} 요약`,
    link: '',
    postedAt: createdAt,
    category: '일반',
    createdAt: createdAt.toISOString(),
    author: '관리자',
    department: '학생지원팀',
    source: 'notice',
    contentDetail: `학교 공지 ${index} 상세`,
    contentAttachments: [],
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  };
}

describe('MockNoticeRepository', () => {
  let repository: MockNoticeRepository;

  beforeEach(() => {
    repository = new MockNoticeRepository();
  });

  afterEach(() => {
    repository.clearMockData();
  });

  it('기본 seed가 app notice가 아니라 학교 공지 source를 사용한다', async () => {
    const notices = await repository.getRecentNotices(1);

    expect(notices).toHaveLength(1);
    expect(notices[0].source).toBe('notice');
  });

  it('구독이 반환한 cursor로 다음 페이지를 이어서 조회한다', async () => {
    repository.clearMockData();
    Array.from({ length: 21 }, (_, index) => createMockNotice(index + 1)).forEach((notice) => {
      repository.addMockNotice(notice);
    });

    const callbacks = createMockSubscriptionCallbacks<NoticeListPage>();
    const unsubscribe = repository.subscribeToNotices('전체', 20, callbacks);

    await waitForMs(20);

    expect(callbacks.onData).toHaveBeenCalledTimes(1);
    const firstPage = callbacks.onData.mock.calls[0][0];

    expect(firstPage.data).toHaveLength(20);
    expect(firstPage.cursor).toBe('notice-2');
    expect(firstPage.hasMore).toBe(true);

    const nextPage = await repository.getMoreNotices('전체', firstPage.cursor, 20);

    expect(nextPage.data.map((notice) => notice.id)).toEqual(['notice-1']);
    expect(nextPage.hasMore).toBe(false);
    expect(nextPage.cursor).toBe('notice-1');

    unsubscribe();
  });
});

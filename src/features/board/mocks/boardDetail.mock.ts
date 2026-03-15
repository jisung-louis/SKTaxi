import type {BoardDetailSourceItem} from '../model/boardDetailData';
import {BOARD_POSTS_MOCK} from './boardPost.mock';

type BoardDetailOverride = Partial<
  Omit<
    BoardDetailSourceItem,
    'authorName' | 'bookmarkCount' | 'category' | 'createdAt' | 'id' | 'isAnonymous' | 'likeCount' | 'title'
  >
>;

const BOARD_DETAIL_OVERRIDES: Record<string, BoardDetailOverride> = {
  'board-2': {
    bodyBlocks: [
      {
        id: 'board-2-body-1',
        text:
          '오늘 학식 돈까스 진짜 맛있었어요 ㅎㅎ 다들 드셔보세요! 소스도 달달하고 고기도 두꺼워서 완전 만족스러웠어요. 가격 대비 퀄리티 최고인 것 같아요. 내일도 나왔으면 좋겠다...',
        type: 'paragraph',
      },
    ],
    comments: [
      {
        authorName: '익명',
        content: '저도 먹었는데 진짜 맛있었어요!',
        id: 'board-2-comment-1',
        likeCount: 5,
        postedAt: '2026-03-20T11:00:00+09:00',
      },
      {
        authorName: '익명',
        content: '내일도 나왔으면 좋겠다 ㅠㅠ',
        id: 'board-2-comment-2',
        likeCount: 2,
        postedAt: '2026-03-20T11:30:00+09:00',
      },
      {
        authorName: '익명',
        content: '저는 오늘 못 먹었는데 아쉽네요 ㅠ',
        id: 'board-2-comment-3',
        likeCount: 1,
        postedAt: '2026-03-20T12:00:00+09:00',
      },
    ],
  },
  'board-6': {
    bodyBlocks: [
      {
        id: 'board-6-body-1',
        text:
          '캡스톤 발표 준비하면서 써본 템플릿 중 깔끔했던 것들 공유해요. 발표 시간 짧을수록 핵심 슬라이드 중심으로 정리하는 게 좋았습니다.',
        type: 'paragraph',
      },
      {
        alt: '발표 자료 예시 이미지',
        aspectRatio: 343 / 220,
        id: 'board-6-image-1',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
      },
    ],
    comments: [
      {
        authorName: '익명',
        content: '템플릿 공유 감사합니다!',
        id: 'board-6-comment-1',
        likeCount: 3,
        postedAt: '2026-03-14T22:40:00+09:00',
      },
    ],
  },
};

export const BOARD_DETAIL_MOCK: BoardDetailSourceItem[] = BOARD_POSTS_MOCK.map(
  post => {
    const override = BOARD_DETAIL_OVERRIDES[post.id];

    return {
      authorName: post.isAnonymous ? '익명' : post.authorName,
      bodyBlocks: override?.bodyBlocks ?? [
        {
          id: `${post.id}-body-1`,
          text: `${post.content}\n\n관련 경험이나 의견이 있으면 댓글로 남겨주세요.`,
          type: 'paragraph',
        },
      ],
      bookmarkCount: post.bookmarkCount,
      category: post.category,
      comments: override?.comments ?? [],
      createdAt: post.createdAt,
      id: post.id,
      isAnonymous: post.isAnonymous,
      likeCount: post.likeCount,
      title: post.title,
    };
  },
);

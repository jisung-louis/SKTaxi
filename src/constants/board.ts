import { BoardCategory } from '../types/board';

export const BOARD_CATEGORIES: BoardCategory[] = [
  {
    id: 'general',
    name: '자유게시판',
    shortName: '자유',
    description: '자유롭게 이야기해요',
    postCount: 0,
    color: '#4A90E2',
  },
  {
    id: 'question',
    name: '질문게시판',
    shortName: '질문',
    description: '궁금한 것을 물어보세요',
    postCount: 0,
    color: '#7ED321',
  },
  {
    id: 'review',
    name: '후기게시판',
    shortName: '후기',
    description: '경험을 공유해보세요',
    postCount: 0,
    color: '#F5A623',
  },
  {
    id: 'announcement',
    name: '공지사항',
    shortName: '공지',
    description: '중요한 소식을 전해드려요',
    postCount: 0,
    color: '#D0021B',
  },
];

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'mostCommented', label: '댓글많은순' },
  { value: 'mostViewed', label: '조회많은순' },
] as const;

export const POST_CATEGORY_LABELS = {
  general: '자유',
  question: '질문',
  review: '후기',
  announcement: '공지',
} as const;


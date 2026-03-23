import type {CommunityChatRoomSourceItem} from '../model/communityHomeData';
import {BOARD_POSTS_MOCK} from '@/features/board/mocks/boardPost.mock';

export const COMMUNITY_BOARD_POSTS_MOCK = BOARD_POSTS_MOCK;

export const COMMUNITY_CHAT_ROOMS_MOCK: CommunityChatRoomSourceItem[] = [
  {
    description: '성결대학교 학생 누구나 들어와 이야기할 수 있는 공개 채팅방이에요.',
    id: 'chat-1',
    isJoined: true,
    lastMessageText: '오늘 학식 뭐예요?',
    memberCount: 1247,
    title: '성결대학교 전체',
    tone: 'university',
    unreadCount: 5,
    updatedAt: '2026-03-15T12:45:00+09:00',
  },
  {
    description: '컴퓨터공학과 학생을 위한 공개 학과방이에요.',
    id: 'chat-2',
    isJoined: true,
    lastMessageText: '과제 언제까지예요?',
    memberCount: 156,
    title: '컴퓨터공학과',
    tone: 'department',
    unreadCount: 2,
    updatedAt: '2026-03-15T11:30:00+09:00',
  },
  {
    description: '경영학과 학생을 위한 공개 학과방이에요.',
    id: 'chat-3',
    isJoined: false,
    lastMessageText: '다음주 시험 범위 아시는 분?',
    memberCount: 203,
    title: '경영학과',
    tone: 'department',
    unreadCount: 0,
    updatedAt: '2026-03-15T10:15:00+09:00',
  },
  {
    description: '시험기간 같이 공부할 사람을 찾는 커스텀 공개방이에요.',
    id: 'chat-4',
    isJoined: true,
    lastMessageText: '내일 몇 시에 만날까요?',
    memberCount: 8,
    title: '스터디 모임',
    tone: 'custom',
    unreadCount: 1,
    updatedAt: '2026-03-15T09:00:00+09:00',
  },
];

// SKTaxi: Firebase 모킹 유틸리티
// 테스트에서 사용할 수 있는 Firebase 관련 mock 헬퍼

import { Party } from '../../types/party';
import { ChatRoom, ChatMessage, UserDoc } from '../../types/firestore';
import { BoardPost, BoardComment } from '../../types/board';

/**
 * Mock Firestore 문서 스냅샷 생성
 */
export function createMockDocumentSnapshot<T>(
  id: string,
  data: T | null,
  exists: boolean = true
) {
  return {
    id,
    exists: () => exists,
    data: () => data,
    ref: { id },
  };
}

/**
 * Mock Firestore 쿼리 스냅샷 생성
 */
export function createMockQuerySnapshot<T extends { id?: string }>(items: T[]) {
  return {
    docs: items.map((item) =>
      createMockDocumentSnapshot(item.id || '', item, true)
    ),
    empty: items.length === 0,
    size: items.length,
  };
}

/**
 * Mock Party 데이터 생성
 */
export function createMockParty(overrides: Partial<Party> = {}): Party {
  return {
    id: 'party-1',
    leaderId: 'user-1',
    departure: { name: '성결대학교', lat: 37.4, lng: 127.0 },
    destination: { name: '강남역', lat: 37.5, lng: 127.0 },
    departureTime: new Date().toISOString(),
    maxMembers: 4,
    members: ['user-1'],
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock ChatRoom 데이터 생성
 */
export function createMockChatRoom(overrides: Partial<ChatRoom> = {}): ChatRoom {
  return {
    id: 'chat-room-1',
    name: '테스트 채팅방',
    type: 'university',
    createdBy: 'user-1',
    members: ['user-1'],
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock ChatMessage 데이터 생성
 */
export function createMockChatMessage(
  overrides: Partial<ChatMessage> = {}
): ChatMessage {
  return {
    id: 'message-1',
    text: '테스트 메시지',
    senderId: 'user-1',
    senderName: '테스트 사용자',
    type: 'text',
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock UserDoc 데이터 생성
 */
export function createMockUser(overrides: Partial<UserDoc> = {}): UserDoc {
  return {
    displayName: '테스트 사용자',
    photoUrl: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    lastActiveAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock BoardPost 데이터 생성
 */
export function createMockBoardPost(overrides: Partial<BoardPost> = {}): BoardPost {
  return {
    id: 'post-1',
    title: '테스트 게시물',
    content: '테스트 내용입니다.',
    authorId: 'user-1',
    authorName: '테스트 사용자',
    category: 'general',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    isPinned: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock BoardComment 데이터 생성
 */
export function createMockBoardComment(
  overrides: Partial<BoardComment> = {}
): BoardComment {
  return {
    id: 'comment-1',
    postId: 'post-1',
    content: '테스트 댓글입니다.',
    authorId: 'user-1',
    authorName: '테스트 사용자',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock 구독 콜백 생성
 */
export function createMockSubscriptionCallbacks<T>() {
  return {
    onData: jest.fn(),
    onError: jest.fn(),
  };
}

/**
 * 비동기 테스트 헬퍼 - 특정 시간 대기
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Jest Mock 함수 타입 체크 헬퍼
 */
export function asMock<T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

// Jest가 이 파일을 테스트 파일로 인식하지 않도록 하는 placeholder 테스트
describe('Firebase Mocks', () => {
  it('should export mock utilities', () => {
    expect(createMockParty).toBeDefined();
    expect(createMockChatRoom).toBeDefined();
    expect(createMockChatMessage).toBeDefined();
  });
});

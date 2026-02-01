// SKTaxi: User Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import {
  IUserRepository,
  UserProfile,
  UserDisplayNameMap,
} from '../interfaces/IUserRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Mock User Repository 구현체
 */
export class MockUserRepository implements IUserRepository {
  private users: Map<string, UserProfile> = new Map();
  private bookmarks: Map<string, string[]> = new Map();

  constructor() {
    // 기본 테스트 사용자 추가
    this.users.set('user1', {
      id: 'user1',
      displayName: '테스트 사용자 1',
      email: 'test1@example.com',
      studentId: '20210001',
      department: '컴퓨터공학과',
      isVerified: true,
    });
    this.users.set('user2', {
      id: 'user2',
      displayName: '테스트 사용자 2',
      email: 'test2@example.com',
      studentId: '20210002',
      department: '소프트웨어학과',
      isVerified: true,
    });
  }

  subscribeToUserProfile(
    userId: string,
    callbacks: SubscriptionCallbacks<UserProfile | null>
  ): Unsubscribe {
    const user = this.users.get(userId) || null;
    setTimeout(() => callbacks.onData(user), 10);
    return () => {};
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) || null;
  }

  async getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap> {
    const result: UserDisplayNameMap = {};
    userIds.forEach(id => {
      const user = this.users.get(id);
      result[id] = user?.displayName || '익명';
    });
    return result;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const existing = this.users.get(userId);
    if (existing) {
      this.users.set(userId, { ...existing, ...updates });
    }
  }

  async createUserProfile(userId: string, profile: Omit<UserProfile, 'id'>): Promise<void> {
    this.users.set(userId, { id: userId, ...profile });
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    // Mock: 토큰 저장 시뮬레이션
    console.log(`[Mock] FCM 토큰 저장: ${userId} -> ${token.substring(0, 10)}...`);
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    // Mock: 토큰 제거 시뮬레이션
    console.log(`[Mock] FCM 토큰 제거: ${userId} -> ${token.substring(0, 10)}...`);
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    return this.bookmarks.get(userId) || [];
  }

  async addBookmark(userId: string, postId: string): Promise<void> {
    const current = this.bookmarks.get(userId) || [];
    if (!current.includes(postId)) {
      this.bookmarks.set(userId, [...current, postId]);
    }
  }

  async removeBookmark(userId: string, postId: string): Promise<void> {
    const current = this.bookmarks.get(userId) || [];
    this.bookmarks.set(userId, current.filter(id => id !== postId));
  }

  subscribeToBookmarks(
    userId: string,
    callbacks: SubscriptionCallbacks<string[]>
  ): Unsubscribe {
    const bookmarks = this.bookmarks.get(userId) || [];
    setTimeout(() => callbacks.onData(bookmarks), 10);
    return () => {};
  }

  async deleteAccountInfo(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const { accountInfo, ...rest } = user;
      this.users.set(userId, rest as UserProfile);
    }
  }

  async checkDisplayNameAvailable(displayName: string, excludeUserId?: string): Promise<void> {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('닉네임을 입력해주세요.');
    }

    // Mock: 닉네임 중복 검사
    for (const [userId, user] of this.users) {
      if (user.displayName === trimmed && userId !== excludeUserId) {
        throw new Error('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      }
    }
  }

  // 테스트용 헬퍼 메서드
  addMockUser(user: UserProfile): void {
    this.users.set(user.id, user);
  }

  clearMockData(): void {
    this.users.clear();
    this.bookmarks.clear();
  }
}

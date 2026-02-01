// SKTaxi: User Repository 인터페이스 - DIP 원칙 적용
// 사용자 프로필 및 인증 관련 데이터 접근 추상화

import { UserDoc } from '../../types/firestore';
import { Unsubscribe, SubscriptionCallbacks } from './IPartyRepository';

/**
 * 사용자 프로필 타입 (확장된 UserDoc)
 */
export interface UserProfile extends UserDoc {
  id: string;
  email?: string;
  studentId?: string;
  department?: string;
  phoneNumber?: string;
  joinedAt?: unknown;
  isVerified?: boolean;
  bio?: string;
  isAdmin?: boolean;
  accountInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    hideName: boolean;
  };
}

/**
 * 사용자 표시 이름 맵
 */
export type UserDisplayNameMap = Record<string, string>;

/**
 * User Repository 인터페이스
 */
export interface IUserRepository {
  /**
   * 현재 사용자 프로필 실시간 구독
   * @param userId - 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToUserProfile(userId: string, callbacks: SubscriptionCallbacks<UserProfile | null>): Unsubscribe;

  /**
   * 사용자 프로필 조회 (단일)
   * @param userId - 사용자 ID
   * @returns 사용자 프로필 또는 null
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /**
   * 여러 사용자의 표시 이름 조회
   * @param userIds - 사용자 ID 배열
   * @returns 사용자 ID와 표시 이름의 맵
   */
  getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap>;

  /**
   * 사용자 프로필 업데이트
   * @param userId - 사용자 ID
   * @param updates - 업데이트할 필드
   */
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;

  /**
   * 사용자 프로필 생성 (회원가입 시)
   * @param userId - 사용자 ID
   * @param profile - 초기 프로필 데이터
   */
  createUserProfile(userId: string, profile: Omit<UserProfile, 'id'>): Promise<void>;

  /**
   * FCM 토큰 저장
   * @param userId - 사용자 ID
   * @param token - FCM 토큰
   */
  saveFcmToken(userId: string, token: string): Promise<void>;

  /**
   * FCM 토큰 제거
   * @param userId - 사용자 ID
   * @param token - 제거할 FCM 토큰
   */
  removeFcmToken(userId: string, token: string): Promise<void>;

  /**
   * 사용자 북마크 목록 조회
   * @param userId - 사용자 ID
   * @returns 북마크된 게시물 ID 배열
   */
  getUserBookmarks(userId: string): Promise<string[]>;

  /**
   * 북마크 추가
   * @param userId - 사용자 ID
   * @param postId - 게시물 ID
   */
  addBookmark(userId: string, postId: string): Promise<void>;

  /**
   * 북마크 제거
   * @param userId - 사용자 ID
   * @param postId - 게시물 ID
   */
  removeBookmark(userId: string, postId: string): Promise<void>;

  /**
   * 북마크 목록 실시간 구독
   * @param userId - 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToBookmarks(userId: string, callbacks: SubscriptionCallbacks<string[]>): Unsubscribe;

  /**
   * 계좌 정보 삭제
   * @param userId - 사용자 ID
   */
  deleteAccountInfo(userId: string): Promise<void>;

  /**
   * 닉네임 중복 검사
   * @param displayName - 검사할 닉네임
   * @param excludeUserId - 제외할 사용자 ID (본인)
   * @throws Error 중복 시
   */
  checkDisplayNameAvailable(displayName: string, excludeUserId?: string): Promise<void>;
}

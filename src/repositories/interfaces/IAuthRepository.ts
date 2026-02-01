// SKTaxi: Auth Repository 인터페이스 - 인증 관련 데이터 접근 추상화

import { Unsubscribe, SubscriptionCallbacks } from '../../api/types';

/**
 * 사용자 인증 정보
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Google 로그인 결과
 */
export interface GoogleSignInResult {
  user: AuthUser;
  idToken: string;
  isNewUser: boolean;
}

/**
 * Auth Repository 인터페이스
 */
export interface IAuthRepository {
  /**
   * 현재 인증 사용자 조회
   * @returns 인증된 사용자 또는 null
   */
  getCurrentUser(): AuthUser | null;

  /**
   * 인증 상태 변경 구독
   * @param callbacks - 콜백
   * @returns 구독 해제 함수
   */
  subscribeToAuthState(
    callbacks: SubscriptionCallbacks<AuthUser | null>
  ): Unsubscribe;

  /**
   * Google 로그인
   * @returns 로그인 결과
   */
  signInWithGoogle(): Promise<GoogleSignInResult>;

  /**
   * 로그아웃
   */
  signOut(): Promise<void>;

  /**
   * 계정 삭제
   */
  deleteAccount(): Promise<void>;

  /**
   * 인증 토큰 갱신
   * @param forceRefresh - 강제 갱신 여부
   * @returns 새 토큰
   */
  refreshToken(forceRefresh?: boolean): Promise<string | null>;

  /**
   * 이메일 인증 확인
   * @returns 인증 여부
   */
  isEmailVerified(): boolean;

  /**
   * 인증 이메일 재전송
   */
  resendVerificationEmail(): Promise<void>;

  /**
   * 이메일/비밀번호 로그인 (관리자용)
   * @param email - 이메일
   * @param password - 비밀번호
   * @returns 인증 사용자
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser>;
}

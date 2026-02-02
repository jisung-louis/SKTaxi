// SKTaxi: FCM 토큰 관리 Repository 인터페이스
// Firebase Cloud Messaging 토큰 저장/갱신을 추상화

export interface IFcmRepository {
  /**
   * 현재 FCM 토큰을 가져옵니다 (재시도 로직 포함)
   * @param maxTries - 최대 시도 횟수
   * @param delayMs - 시도 간 지연 시간 (ms)
   */
  getFcmToken(maxTries?: number, delayMs?: number): Promise<string | null>;

  /**
   * FCM 토큰을 사용자 문서에 저장합니다
   * @param userId - 사용자 ID
   * @param token - FCM 토큰
   */
  saveFcmToken(userId: string, token: string): Promise<void>;

  /**
   * FCM 토큰 갱신 이벤트를 구독합니다
   * @param userId - 사용자 ID
   * @param callback - 토큰 갱신 시 호출될 콜백
   * @returns 구독 해제 함수
   */
  subscribeToTokenRefresh(
    userId: string,
    callback: (token: string) => Promise<void>
  ): () => void;

  /**
   * iOS에서 원격 메시지 등록을 보장합니다
   * @deprecated 더 이상 필요하지 않음 - auto-registration이 기본 활성화됨
   */
  registerDeviceForRemoteMessages?(): Promise<void>;

  /**
   * 사용자의 FCM 토큰을 삭제합니다 (로그아웃 시 호출)
   * @param userId - 사용자 ID
   */
  deleteFcmTokens(userId: string): Promise<void>;
}

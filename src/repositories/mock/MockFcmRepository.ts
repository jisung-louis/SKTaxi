// SKTaxi: FCM Repository Mock 구현체 (테스트용)

import { IFcmRepository } from '../interfaces/IFcmRepository';

export class MockFcmRepository implements IFcmRepository {
  async getFcmToken(_maxTries?: number, _delayMs?: number): Promise<string | null> {
    return 'mock-fcm-token-12345';
  }

  async saveFcmToken(_userId: string, _token: string): Promise<void> {
    // Mock: 저장 완료
  }

  subscribeToTokenRefresh(
    _userId: string,
    _callback: (token: string) => Promise<void>
  ): () => void {
    return () => {};
  }

  async registerDeviceForRemoteMessages(): Promise<void> {
    // Mock: 등록 완료
  }

  async deleteFcmTokens(_userId: string): Promise<void> {
    // Mock: 삭제 완료
  }
}

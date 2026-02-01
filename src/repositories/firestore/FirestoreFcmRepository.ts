// SKTaxi: FCM Repository Firebase 구현체
// Firebase Messaging을 사용하여 FCM 토큰 관리

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { IFcmRepository } from '../interfaces/IFcmRepository';

export class FirestoreFcmRepository implements IFcmRepository {
  async getFcmToken(maxTries = 3, delayMs = 800): Promise<string | null> {
    for (let i = 0; i < maxTries; i += 1) {
      try {
        const token = await messaging().getToken();
        if (token) return token;
      } catch {
        // 실패 시 재시도
      }
      await new Promise(res => setTimeout(res, delayMs));
    }
    return null;
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    // 단일기기 정책 - 현재 토큰만 유지
    await firestore().collection('users').doc(userId)
      .set({ fcmTokens: [token] }, { merge: true });
  }

  subscribeToTokenRefresh(
    userId: string,
    callback: (token: string) => Promise<void>
  ): () => void {
    const unsubscribe = messaging().onTokenRefresh(async (token) => {
      if (!token) return;
      try {
        await callback(token);
      } catch (e) {
        console.warn('onTokenRefresh callback failed:', e);
      }
    });
    return unsubscribe;
  }

  async registerDeviceForRemoteMessages(): Promise<void> {
    try {
      await messaging().registerDeviceForRemoteMessages();
    } catch {
      // Android에서는 무시됨
    }
  }

  async deleteFcmTokens(userId: string): Promise<void> {
    await firestore().collection('users').doc(userId)
      .update({ fcmTokens: [] });
  }
}

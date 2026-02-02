// SKTaxi: FCM Repository Firebase 구현체 - v22 Modular API
// Firebase Messaging을 사용하여 FCM 토큰 관리

import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { IFcmRepository } from '../interfaces/IFcmRepository';

export class FirestoreFcmRepository implements IFcmRepository {
  private messaging = getMessaging();
  private db = getFirestore();

  async getFcmToken(maxTries = 3, delayMs = 800): Promise<string | null> {
    for (let i = 0; i < maxTries; i += 1) {
      try {
        const token = await getToken(this.messaging);
        if (token) {return token;}
      } catch {
        // 실패 시 재시도
      }
      await new Promise(res => setTimeout(res, delayMs));
    }
    return null;
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    // 단일기기 정책 - 현재 토큰만 유지
    const userRef = doc(this.db, 'users', userId);
    await setDoc(userRef, { fcmTokens: [token] }, { merge: true });
  }

  subscribeToTokenRefresh(
    userId: string,
    callback: (token: string) => Promise<void>
  ): () => void {
    const unsubscribe = onTokenRefresh(this.messaging, async (token) => {
      if (!token) {return;}
      try {
        await callback(token);
      } catch (e) {
        console.warn('onTokenRefresh callback failed:', e);
      }
    });
    return unsubscribe;
  }

  async deleteFcmTokens(userId: string): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, { fcmTokens: [] });
  }
}

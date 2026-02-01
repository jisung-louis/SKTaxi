// SKTaxi: 앱 시작 시 사용자 FCM 토큰을 users 문서에 중복 없이 저장하는 유틸
// IFcmRepository를 사용하여 Firebase 직접 의존 제거

import auth from '@react-native-firebase/auth';
import { FirestoreFcmRepository } from '../repositories/firestore/FirestoreFcmRepository';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const fcmRepository = new FirestoreFcmRepository();

export async function ensureFcmTokenSaved(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;

  console.log('ensureFcmTokenSaved');
  try {
    // iOS에서 원격 메시지 등록 보장 (안드로이드는 무시됨)
    await fcmRepository.registerDeviceForRemoteMessages();

    const token = await fcmRepository.getFcmToken();
    console.log('token:', token);
    if (!token) return;

    // 단일기기 정책 - 현재 토큰만 유지
    await fcmRepository.saveFcmToken(user.uid, token);
  } catch (e) {
    console.warn('ensureFcmTokenSaved failed:', e);
  }
}

// FCM 토큰이 회전될 때(users 문서에 중복 없이) 자동 저장
export function subscribeFcmTokenRefresh() {
  const user = auth().currentUser;
  if (!user) {
    return () => {};
  }

  return fcmRepository.subscribeToTokenRefresh(user.uid, async (token) => {
    try {
      // 단일기기 정책 - 새 토큰으로 교체
      await fcmRepository.saveFcmToken(user.uid, token);
    } catch (e) {
      console.warn('onTokenRefresh update failed:', e);
    }
  });
}

/**
 * FCM 토큰 삭제 (로그아웃 시 호출)
 * @param userId - 사용자 ID
 */
export async function deleteFcmToken(userId: string): Promise<void> {
  try {
    await fcmRepository.deleteFcmTokens(userId);
    console.log('✅ FCM 토큰 삭제 완료');
  } catch (error) {
    console.warn('FCM 토큰 삭제 실패:', error);
    // 삭제 실패가 로그아웃을 막지 않음
  }
}

// SKTaxi: 앱 시작 시 사용자 FCM 토큰을 users 문서에 중복 없이 저장하는 유틸 추가
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

async function getFcmTokenWithRetry(maxTries = 3, delayMs = 800): Promise<string | null> {
  for (let i = 0; i < maxTries; i += 1) {
    const token = await messaging().getToken().catch(() => null);
    if (token) return token;
    await new Promise(res => setTimeout(res, delayMs));
  }
  return null;
}

export async function ensureFcmTokenSaved(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;

  console.log('ensureFcmTokenSaved');
  try {
    // SKTaxi: iOS에서 원격 메시지 등록 보장 (안드로이드는 무시됨)
    try { await messaging().registerDeviceForRemoteMessages(); } catch {}
    const token = await getFcmTokenWithRetry();
    console.log('token:', token);
    if (!token) return;

    // SKTaxi: 단일기기 정책 - 현재 토큰만 유지
    await firestore().collection('users').doc(user.uid)
      .set({ fcmTokens: [token] }, { merge: true });
  } catch (e) {
    console.warn('ensureFcmTokenSaved failed:', e); // SKTaxi: 실패 시 콘솔 경고
  }
}

// SKTaxi: FCM 토큰이 회전될 때(users 문서에 중복 없이) 자동 저장
export function subscribeFcmTokenRefresh() {
  const unsubscribe = messaging().onTokenRefresh(async (token) => {
    const user = auth().currentUser;
    if (!user || !token) return;
    try {
      // SKTaxi: 단일기기 정책 - 새 토큰으로 교체
      await firestore().collection('users').doc(user.uid)
        .set({ fcmTokens: [token] }, { merge: true });
    } catch (e) {
      console.warn('onTokenRefresh update failed:', e); // SKTaxi: 실패 로그
    }
  });
  return unsubscribe;
}



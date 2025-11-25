import { useState, useEffect } from 'react';
import { authInstance, createUserProfile, getUserProfile } from '../libs/firebase';
import { ensureFcmTokenSaved } from '../lib/fcm'; // SKTaxi: FCM 토큰 관리
import { getCurrentAppVersion } from '../lib/versionCheck'; // SKTaxi: 앱 버전 가져오기
import { User, AuthState } from '../types/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { setUserId } from '../lib/analytics';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribeAuth = authInstance().onAuthStateChanged(async (firebaseUser) => {
      // 기존 프로필 구독 해제
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      // Analytics: 사용자 ID 설정 (로그인/로그아웃 시 자동 처리)
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
      } else {
        setUserId(null);
      }

      if (firebaseUser) {
        // SKTaxi: 자동 로그인 시에도 lastLogin과 currentVersion 업데이트
        try {
          const currentVersion = getCurrentAppVersion();
          firestore().collection('users').doc(firebaseUser.uid).update({
            lastLogin: firestore.FieldValue.serverTimestamp(),
            currentVersion: currentVersion,
            lastLoginOS: Platform.OS,
          }).catch((e) => {
            console.warn('자동 로그인 정보 업데이트 실패:', e);
          });
        } catch (e) {
          console.warn('자동 로그인 정보 업데이트 실패:', e);
        }
        
        // 사용자 문서 실시간 구독: 프로필 완료 저장 직후 반영
        const userDocRef = firestore().collection('users').doc(firebaseUser.uid);
        unsubscribeProfile = userDocRef.onSnapshot((snap) => {
          const data = snap.data() as User | undefined;
          if (data) {
            setState({ user: data, loading: false });
          } else {
            setState({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: '스쿠리 유저',
                studentId: null,
                department: null,
                photoURL: firebaseUser.photoURL,
                linkedAccounts: [],
                realname: null,
              },
              loading: false,
            });
          }
        });
      } else {
        setState({ user: null, loading: false });
      }
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  // email/password 제거됨

  const signOut = async () => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      
      // 1. 로그아웃 전에 사용자 정보와 토큰 미리 저장
      const currentUser = auth().currentUser;
      const currentToken = await messaging().getToken().catch(() => null);
      
      // 2. Firebase Auth에서 로그아웃
      await authInstance().signOut();
      
      // 3. 저장된 정보로 FCM 토큰 제거
      if (currentUser && currentToken) {
        await firestore().collection('users').doc(currentUser.uid)
          .update({ fcmTokens: firestore.FieldValue.arrayRemove(currentToken) })
          .catch(() => {});
      }
      
      // 4. Google Sign-Out
      await GoogleSignin.signOut().catch(() => {});
      
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // resetPassword 제거됨

  const signInWithGoogle = async (): Promise<{ firstLogin: boolean }> => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 구글 로그인 호출 및 즉시 취소/에러 분리
      let result: any;
      try {
        result = await GoogleSignin.signIn();
      } catch (err: any) {
        const code = err?.code || err?.status;
        const message: string = err?.message || '';
        if (code === statusCodes.SIGN_IN_CANCELLED || String(message).includes('SIGN_IN_CANCELLED')) {
          throw { code: 'auth/cancelled', message: '로그인을 취소했어요.' };
        }
        if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw { code: 'auth/play-services-unavailable', message: 'Google Play 서비스를 사용할 수 없습니다. 업데이트 후 다시 시도해주세요.' };
        }
        if (code === statusCodes.IN_PROGRESS) {
          throw { code: 'auth/in-progress', message: '로그인을 진행 중이에요.' };
        }
        throw err;
      }

      const googleUser = result?.data?.user || result?.user; // sdk 버전별 호환
      const idToken: string | null | undefined = result?.data?.idToken || result?.idToken;
      const email = googleUser?.email || '';
      console.log('Google 로그인 결과:', JSON.stringify(result, null, 2));
      // 계정 선택 모달에서 취소되었거나 토큰이 생성되지 않은 경우: 취소로 간주
      if (!idToken) {
        throw { code: 'auth/cancelled', message: '로그인을 취소했어요.' };
      }
      // 도메인 제한
      if (!email.endsWith('@sungkyul.ac.kr')) {
        await GoogleSignin.signOut().catch(() => {});
        throw { code: 'auth/domain-restricted', message: '성결대학교 이메일(@sungkyul.ac.kr)만 사용 가능합니다.' };
      }
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const fbCred = await auth().signInWithCredential(credential);
      console.log('fbCred:', JSON.stringify(fbCred, null, 2));
      const fbUser = fbCred.user;
      const profile = await getUserProfile(fbUser.uid);
      let firstLogin = false;
      if (!profile) {
        await createUserProfile(fbUser.uid, {
          uid: fbUser.uid,
          email: fbUser.email || googleUser?.email || '',
          displayName: '스쿠리 유저', // Default name, 이 다음 스텝에서 유저의 닉네임을 받고 업데이트
          photoURL: fbUser.photoURL || googleUser?.photo || null,
          linkedAccounts: [{
            provider: 'google',
            providerId: fbUser.providerData?.[0]?.uid || fbUser.uid,
            email: fbUser.email || googleUser?.email || '',
            displayName: fbUser.displayName || googleUser?.name || null,
            photoURL: fbUser.photoURL || googleUser?.photo || null,
          }],
          studentId: null,
          realname: null,
          department: null,
        });
        firstLogin = true;
      }
      
      // SKTaxi: 로그인 성공 시 lastLogin과 currentVersion 업데이트
      try {
        const currentVersion = getCurrentAppVersion();
        await firestore().collection('users').doc(fbUser.uid).update({
          lastLogin: firestore.FieldValue.serverTimestamp(),
          currentVersion: currentVersion,
          lastLoginOS: Platform.OS,
        });
        console.log('✅ 로그인 정보 업데이트 완료:', { lastLogin: 'now', currentVersion, lastLoginOS: Platform.OS });
      } catch (e) {
        console.warn('로그인 정보 업데이트 실패:', e);
        // 로그인 정보 업데이트 실패해도 로그인은 계속 진행
      }
      
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      return { firstLogin };
    } catch (error: any) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      // 에러 케이스 다각화
      try {
        const code = error?.code || error?.status;
        const message: string = error?.message || '';

        // 1) 사용자가 취소한 경우
        if (code === statusCodes.SIGN_IN_CANCELLED || String(message).includes('SIGN_IN_CANCELLED')) {
          throw { code: 'auth/cancelled', message: '로그인을 취소했어요.' };
        }
        // 2) Google Play Services 미설치/중단 (안드로이드)
        if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw { code: 'auth/play-services-unavailable', message: 'Google Play 서비스를 사용할 수 없습니다. 업데이트 후 다시 시도해주세요.' };
        }
        // 3) 진행 중 중복 호출
        if (code === statusCodes.IN_PROGRESS) {
          throw { code: 'auth/in-progress', message: '로그인을 진행 중이에요.' };
        }
        // 4) 네트워크 오류
        if (code === 'auth/network-request-failed' || String(message).toLowerCase().includes('network')) {
          throw { code: 'auth/network', message: '네트워크 연결을 확인한 후 다시 시도해주세요.' };
        }
        // 5) 자격 증명 오류
        if (code === 'auth/invalid-credential') {
          throw { code: 'auth/invalid-credential', message: '로그인 정보가 유효하지 않습니다. 다시 시도해주세요.' };
        }
        // 6) 도메인 제한(상위 로직에서 throw한 메시지 전파)
        if (String(message).includes('@sungkyul.ac.kr')) {
          throw { code: 'auth/domain-restricted', message };
        }
        // 7) 기타
        throw { code: code || 'auth/unknown', message: message || '잠시 후 다시 시도해주세요.' };
      } catch (mapped) {
        console.error('Google 로그인 중 오류:', mapped);
        throw mapped;
      }
    }
  };

  return {
    ...state,
    signOut,
    signInWithGoogle,
  };
}; 
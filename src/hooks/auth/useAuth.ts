// SKTaxi: useAuth 훅 - Repository 패턴 적용
// IAuthRepository를 사용하여 Firebase 직접 의존 제거

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRepository } from '../../di';
import { User, AuthState } from '../../types/auth';
import { setUserId } from '../../lib/analytics';
import { getCurrentAppVersion } from '../../lib/versionCheck';
import { deleteFcmToken } from '../../lib/fcm';

interface UseAuthResult extends AuthState {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ firstLogin: boolean }>;
}

export const useAuth = (): UseAuthResult => {
  const { authRepository, userRepository } = useRepository();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    // 인증 상태 구독
    const unsubscribeAuth = authRepository.subscribeToAuthState({
      onData: async (authUser) => {
        // 기존 프로필 구독 해제
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        // Analytics: 사용자 ID 설정
        if (authUser) {
          setUserId(authUser.uid);
        } else {
          setUserId(null);
        }

        if (authUser) {
          // 로그인 정보 업데이트
          try {
            const currentVersion = getCurrentAppVersion();
            await userRepository.updateUserProfile(authUser.uid, {
              lastLogin: new Date(),
              currentVersion,
              lastLoginOS: Platform.OS,
            } as any).catch(() => {});
          } catch (e) {
            console.warn('로그인 정보 업데이트 실패:', e);
          }

          // 사용자 프로필 실시간 구독
          unsubscribeProfile = userRepository.subscribeToUserProfile(
            authUser.uid,
            {
              onData: (profile) => {
                if (profile) {
                  setState({
                    user: {
                      ...profile,
                      uid: authUser.uid,
                      photoURL: (profile as any).photoURL || (profile as any).photoUrl || authUser.photoURL || null,
                    } as User,
                    loading: false,
                  });
                } else {
                  setState({
                    user: {
                      uid: authUser.uid,
                      email: authUser.email,
                      displayName: '스쿠리 유저',
                      studentId: null,
                      department: null,
                      photoURL: authUser.photoURL,
                      linkedAccounts: [],
                      realname: null,
                    } as User,
                    loading: false,
                  });
                }
              },
              onError: (error) => {
                console.error('프로필 구독 에러:', error);
                setState((prev) => ({ ...prev, loading: false }));
              },
            }
          );
        } else {
          setState({ user: null, loading: false });
        }
      },
      onError: (error) => {
        console.error('인증 상태 구독 에러:', error);
        setState((prev) => ({ ...prev, loading: false }));
      },
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, [authRepository, userRepository]);

  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // FCM 토큰 제거 (현재 사용자가 있을 때)
      const currentUser = authRepository.getCurrentUser();
      if (currentUser) {
        await deleteFcmToken(currentUser.uid);
      }

      await authRepository.signOut();
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, [authRepository]);

  const signInWithGoogle = useCallback(async (): Promise<{ firstLogin: boolean }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      
      const result = await authRepository.signInWithGoogle();
      
      // 이메일 도메인 검증
      if (result.user.email && !result.user.email.endsWith('@sungkyul.ac.kr')) {
        await authRepository.signOut();
        throw { code: 'auth/domain-restricted', message: '성결대학교 이메일(@sungkyul.ac.kr)만 사용 가능합니다.' };
      }

      // 신규 사용자인 경우 프로필 생성
      if (result.isNewUser) {
        await userRepository.createUserProfile(result.user.uid, {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: '스쿠리 유저',
          photoURL: result.user.photoURL,
          linkedAccounts: [{
            provider: 'google',
            providerId: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          }],
          studentId: null,
          realname: null,
          department: null,
        } as any);
      }

      // 로그인 정보 업데이트
      try {
        const currentVersion = getCurrentAppVersion();
        await userRepository.updateUserProfile(result.user.uid, {
          lastLogin: new Date(),
          currentVersion,
          lastLoginOS: Platform.OS,
        } as any);
      } catch (e) {
        console.warn('로그인 정보 업데이트 실패:', e);
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { firstLogin: result.isNewUser };
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      
      // 에러 매핑
      const code = error?.code || '';
      const message = error?.message || '';
      
      if (code === 'auth/cancelled' || message.includes('취소')) {
        throw { code: 'auth/cancelled', message: '로그인을 취소했어요.' };
      }
      if (message.includes('@sungkyul.ac.kr')) {
        throw error;
      }
      if (code.includes('network')) {
        throw { code: 'auth/network', message: '네트워크 연결을 확인한 후 다시 시도해주세요.' };
      }
      
      throw { code: code || 'auth/unknown', message: message || '잠시 후 다시 시도해주세요.' };
    }
  }, [authRepository, userRepository]);

  return {
    ...state,
    signOut,
    signInWithGoogle,
  };
};

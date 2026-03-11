import { useCallback, useEffect, useState } from 'react';

import { useRepository } from '@/di';
import { AuthState } from '@/types/auth';

import { AuthContextValue } from '../model/types';
import {
  buildFallbackUser,
  finalizeGoogleSignIn,
  mapAuthActionError,
  mapEmailPasswordSignInError,
  mergeProfileUser,
  removeAuthSessionFcmToken,
  setAnalyticsAuthUser,
  syncLoginMetadata,
} from '../services/authSessionService';

export const useAuthSession = (): AuthContextValue => {
  const { authRepository, userRepository } = useRepository();

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = authRepository.subscribeToAuthState({
      onData: async authUser => {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        await setAnalyticsAuthUser(authUser);

        if (!authUser) {
          setState({
            user: null,
            loading: false,
          });
          return;
        }

        try {
          await syncLoginMetadata(userRepository, authUser.uid);
        } catch (error) {
          console.warn('로그인 정보 업데이트 실패:', error);
        }

        unsubscribeProfile = userRepository.subscribeToUserProfile(
          authUser.uid,
          {
            onData: profile => {
              setState({
                user: profile
                  ? mergeProfileUser(authUser, profile as any)
                  : buildFallbackUser(authUser),
                loading: false,
              });
            },
            onError: error => {
              console.error('프로필 구독 에러:', error);
              setState(prev => ({ ...prev, loading: false }));
            },
          },
        );
      },
      onError: error => {
        console.error('인증 상태 구독 에러:', error);
        setState(prev => ({ ...prev, loading: false }));
      },
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribeAuth();
    };
  }, [authRepository, userRepository]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await removeAuthSessionFcmToken(authRepository);
      await authRepository.signOut();
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [authRepository]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const result = await authRepository.signInWithGoogle();
      const firstLogin = await finalizeGoogleSignIn({
        authRepository,
        result,
        userRepository,
      });

      setState(prev => ({ ...prev, loading: false }));
      return { firstLogin };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw mapAuthActionError(error);
    }
  }, [authRepository, userRepository]);

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        await authRepository.signInWithEmailAndPassword(email.trim(), password);
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
        throw mapEmailPasswordSignInError(error);
      }
    },
    [authRepository],
  );

  const refreshAuthToken = useCallback(() => {
    return authRepository.refreshToken();
  }, [authRepository]);

  return {
    ...state,
    signInWithGoogle,
    signInWithEmailAndPassword,
    signOut,
    refreshAuthToken,
  };
};

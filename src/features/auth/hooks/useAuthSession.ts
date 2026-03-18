import { useCallback, useEffect, useRef, useState } from 'react';

import { useRepository } from '@/di';
import { registerAuthTokenResolver } from '@/shared/api';
import { useUserRepository } from '@/features/user';

import { AuthContextValue, AuthState } from '../model/types';
import { AuthUser } from '../data/repositories/IAuthRepository';
import {
  bootstrapAuthenticatedMember,
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
  const { authRepository, memberRepository } = useRepository();
  const userRepository = useUserRepository();
  const bootstrappedMemberUidRef = useRef<string | null>(null);
  const memberBootstrapRef = useRef<{
    uid: string;
    promise: Promise<void>;
  } | null>(null);
  const pendingAuthTransitionRef = useRef<{
    promise: Promise<void>;
    resolve: () => void;
    reject: (error: unknown) => void;
  } | null>(null);

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  const beginPendingAuthTransition = useCallback(() => {
    const pending = pendingAuthTransitionRef.current;
    if (pending) {
      return pending.promise;
    }

    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    pendingAuthTransitionRef.current = {
      promise,
      resolve,
      reject,
    };

    return promise;
  }, []);

  const resolvePendingAuthTransition = useCallback(() => {
    const pending = pendingAuthTransitionRef.current;
    if (!pending) {
      return;
    }

    pendingAuthTransitionRef.current = null;
    pending.resolve();
  }, []);

  const rejectPendingAuthTransition = useCallback((error: unknown) => {
    const pending = pendingAuthTransitionRef.current;
    if (!pending) {
      return;
    }

    pendingAuthTransitionRef.current = null;
    pending.reject(error);
  }, []);

  const ensureMemberBootstrap = useCallback(
    (authUser: AuthUser) => {
      if (bootstrappedMemberUidRef.current === authUser.uid) {
        return Promise.resolve();
      }

      const pending = memberBootstrapRef.current;
      if (pending?.uid === authUser.uid) {
        return pending.promise;
      }

      const promise = (async () => {
        await bootstrapAuthenticatedMember({
          authRepository,
          memberRepository,
        });
        bootstrappedMemberUidRef.current = authUser.uid;
      })().finally(() => {
        if (memberBootstrapRef.current?.promise === promise) {
          memberBootstrapRef.current = null;
        }
      });

      memberBootstrapRef.current = {
        uid: authUser.uid,
        promise,
      };

      return promise;
    },
    [authRepository, memberRepository],
  );

  useEffect(() => {
    return registerAuthTokenResolver(({ forceRefresh } = {}) =>
      authRepository.refreshToken(forceRefresh),
    );
  }, [authRepository]);

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
          bootstrappedMemberUidRef.current = null;
          memberBootstrapRef.current = null;
          setState({
            user: null,
            loading: false,
          });
          return;
        }

        setState(prev => ({ ...prev, loading: true }));

        try {
          await ensureMemberBootstrap(authUser);
        } catch (error) {
          console.error('Spring member bootstrap 실패:', error);
          bootstrappedMemberUidRef.current = null;
          memberBootstrapRef.current = null;
          rejectPendingAuthTransition(error);

          try {
            await authRepository.signOut();
          } catch (signOutError) {
            console.warn('bootstrap 실패 후 로그아웃 실패:', signOutError);
          }

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
                  ? mergeProfileUser(authUser, profile)
                  : buildFallbackUser(authUser),
                loading: false,
              });
              resolvePendingAuthTransition();
            },
            onError: error => {
              console.error('프로필 구독 에러:', error);
              setState({
                user: buildFallbackUser(authUser),
                loading: false,
              });
              resolvePendingAuthTransition();
            },
          },
        );
      },
      onError: error => {
        console.error('인증 상태 구독 에러:', error);
        rejectPendingAuthTransition(error);
        setState(prev => ({ ...prev, loading: false }));
      },
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      memberBootstrapRef.current = null;
      pendingAuthTransitionRef.current = null;
      unsubscribeAuth();
    };
  }, [
    authRepository,
    ensureMemberBootstrap,
    rejectPendingAuthTransition,
    resolvePendingAuthTransition,
    userRepository,
  ]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await removeAuthSessionFcmToken(authRepository, userRepository);
      await authRepository.signOut();
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [authRepository, userRepository]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const authTransition = beginPendingAuthTransition();

      const result = await authRepository.signInWithGoogle();
      const firstLogin = await finalizeGoogleSignIn({
        authRepository,
        result,
        userRepository,
      });
      await authTransition;

      setState(prev => ({ ...prev, loading: false }));
      return { firstLogin };
    } catch (error) {
      rejectPendingAuthTransition(error);
      setState(prev => ({ ...prev, loading: false }));
      throw mapAuthActionError(error);
    }
  }, [
    authRepository,
    beginPendingAuthTransition,
    rejectPendingAuthTransition,
    userRepository,
  ]);

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const authTransition = beginPendingAuthTransition();
        await authRepository.signInWithEmailAndPassword(email.trim(), password);
        await authTransition;
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        rejectPendingAuthTransition(error);
        setState(prev => ({ ...prev, loading: false }));
        throw mapEmailPasswordSignInError(error);
      }
    },
    [authRepository, beginPendingAuthTransition, rejectPendingAuthTransition],
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

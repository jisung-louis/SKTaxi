import {useCallback, useEffect, useRef, useState} from 'react';

import {useRepository} from '@/di';
import type {MemberProfile} from '@/features/member';
import {registerAuthTokenResolver} from '@/shared/api';

import {AuthContextValue, AuthState} from '../model/types';
import {AuthUser} from '../data/repositories/IAuthRepository';
import {
  bootstrapAuthenticatedMember,
  buildAuthenticatedUser,
  buildFallbackUser,
  finalizeGoogleSignIn,
  mapAuthActionError,
  mapEmailPasswordSignInError,
  removeAuthSessionFcmToken,
  setAnalyticsAuthUser,
} from '../services/authSessionService';
import {loadAuthLocalAdjunct} from '../services/authLocalAdjunctService';

export const useAuthSession = (): AuthContextValue => {
  const {authRepository, memberRepository, taxiChatRepository} = useRepository();
  const bootstrappedMemberUidRef = useRef<string | null>(null);
  const currentAuthUidRef = useRef<string | null>(null);
  const memberBootstrapRef = useRef<{
    uid: string;
    promise: Promise<MemberProfile>;
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
        return memberRepository.getMyMemberProfile();
      }

      const pending = memberBootstrapRef.current;
      if (pending?.uid === authUser.uid) {
        return pending.promise;
      }

      const promise = (async () => {
        const memberProfile = await bootstrapAuthenticatedMember({
          authRepository,
          memberRepository,
        });
        bootstrappedMemberUidRef.current = authUser.uid;
        return memberProfile;
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

  const refreshCurrentUser = useCallback(
    async (memberProfile?: MemberProfile) => {
      const authUser = authRepository.getCurrentUser();

      if (!authUser) {
        setState({
          user: null,
          loading: false,
        });
        return;
      }

      const localAdjunct = await loadAuthLocalAdjunct(authUser.uid);

      try {
        const resolvedMemberProfile =
          memberProfile ?? (await memberRepository.getMyMemberProfile());

        setState({
          user: buildAuthenticatedUser({
            authUser,
            localAdjunct,
            memberProfile: resolvedMemberProfile,
          }),
          loading: false,
        });
      } catch (error) {
        console.warn('현재 사용자 재동기화 실패:', error);

        setState(previous => {
          if (previous.user?.uid === authUser.uid) {
            return {
              user: {
                ...previous.user,
                email: authUser.email,
                photoURL: previous.user.photoURL ?? authUser.photoURL ?? null,
                onboarding: {
                  permissionsComplete: localAdjunct.permissionsComplete,
                },
              },
              loading: false,
            };
          }

          return {
            user: buildFallbackUser(authUser, localAdjunct),
            loading: false,
          };
        });

        throw error;
      }
    },
    [authRepository, memberRepository],
  );

  const resetTaxiChatSession = useCallback(async () => {
    try {
      await taxiChatRepository.resetSession();
    } catch (error) {
      console.warn('택시 채팅 세션 정리 실패:', error);
    }
  }, [taxiChatRepository]);

  useEffect(() => {
    return registerAuthTokenResolver(({forceRefresh} = {}) =>
      authRepository.refreshToken(forceRefresh),
    );
  }, [authRepository]);

  useEffect(() => {
    let cancelled = false;

    const unsubscribeAuth = authRepository.subscribeToAuthState({
      onData: async authUser => {
        await setAnalyticsAuthUser(authUser);
        if (cancelled) {
          return;
        }

        const nextAuthUid = authUser?.uid ?? null;
        if (currentAuthUidRef.current !== nextAuthUid) {
          currentAuthUidRef.current = nextAuthUid;
          await resetTaxiChatSession();

          if (cancelled) {
            return;
          }
        }

        if (!authUser) {
          bootstrappedMemberUidRef.current = null;
          memberBootstrapRef.current = null;
          if (!cancelled) {
            setState({
              user: null,
              loading: false,
            });
          }
          return;
        }

        setState(prev => ({...prev, loading: true}));

        try {
          const memberProfile = await ensureMemberBootstrap(authUser);
          const localAdjunct = await loadAuthLocalAdjunct(authUser.uid);

          if (cancelled) {
            return;
          }

          setState({
            user: buildAuthenticatedUser({
              authUser,
              localAdjunct,
              memberProfile,
            }),
            loading: false,
          });
          resolvePendingAuthTransition();
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

          if (!cancelled) {
            setState({
              user: null,
              loading: false,
            });
          }
        }
      },
      onError: error => {
        if (cancelled) {
          return;
        }

        console.error('인증 상태 구독 에러:', error);
        rejectPendingAuthTransition(error);
        setState(previous => {
          if (!previous.user) {
            return {
              ...previous,
              loading: false,
            };
          }

          return {
            user: previous.user,
            loading: false,
          };
        });
      },
    });

    return () => {
      cancelled = true;
      currentAuthUidRef.current = null;
      memberBootstrapRef.current = null;
      pendingAuthTransitionRef.current = null;
      unsubscribeAuth();
    };
  }, [
    authRepository,
    ensureMemberBootstrap,
    rejectPendingAuthTransition,
    resetTaxiChatSession,
    resolvePendingAuthTransition,
  ]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({...prev, loading: true}));
      await resetTaxiChatSession();
      await removeAuthSessionFcmToken(authRepository, memberRepository);
      await authRepository.signOut();
    } catch (error) {
      setState(prev => ({...prev, loading: false}));
      throw error;
    }
  }, [authRepository, memberRepository, resetTaxiChatSession]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({...prev, loading: true}));
      const authTransition = beginPendingAuthTransition();

      const result = await authRepository.signInWithGoogle();
      const firstLogin = await finalizeGoogleSignIn({
        authRepository,
        result,
      });
      await authTransition;

      setState(prev => ({...prev, loading: false}));
      return {firstLogin};
    } catch (error) {
      rejectPendingAuthTransition(error);
      setState(prev => ({...prev, loading: false}));
      throw mapAuthActionError(error);
    }
  }, [authRepository, beginPendingAuthTransition, rejectPendingAuthTransition]);

  const signInWithEmailAndPassword = useCallback(
    async (email: string, password: string) => {
      try {
        setState(prev => ({...prev, loading: true}));
        const authTransition = beginPendingAuthTransition();
        await authRepository.signInWithEmailAndPassword(email.trim(), password);
        await authTransition;
        setState(prev => ({...prev, loading: false}));
      } catch (error) {
        rejectPendingAuthTransition(error);
        setState(prev => ({...prev, loading: false}));
        throw mapEmailPasswordSignInError(error);
      }
    },
    [authRepository, beginPendingAuthTransition, rejectPendingAuthTransition],
  );

  const refreshAuthToken = useCallback(() => {
    return authRepository.refreshToken();
  }, [authRepository]);

  const markPermissionOnboardingComplete = useCallback(() => {
    setState(previous => {
      if (!previous.user) {
        return previous;
      }

      if (previous.user.onboarding?.permissionsComplete) {
        return previous;
      }

      return {
        ...previous,
        user: {
          ...previous.user,
          onboarding: {
            permissionsComplete: true,
          },
        },
      };
    });
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signInWithEmailAndPassword,
    signOut,
    refreshAuthToken,
    refreshCurrentUser,
    markPermissionOnboardingComplete,
  };
};

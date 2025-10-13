import { useState, useEffect } from 'react';
import { authInstance, createUserProfile, getUserProfile, updateUserProfile } from '../libs/firebase';
import { ensureFcmTokenSaved, removeCurrentFcmToken } from '../lib/fcm'; // SKTaxi: FCM 토큰 관리
import { User, SignUpData, SignInData, ResetPasswordData, AuthState, SocialSignInData, LinkedAccount } from '../types/auth';
import { validateEmail } from '../utils/validation';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = authInstance().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setState({
          user: userProfile || {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
          },
          loading: false,
        });
      } else {
        setState({
          user: null,
          loading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      if (!validateEmail(data.email)) {
        throw new Error('성결대학교 이메일(@sungkyul.ac.kr)만 사용 가능합니다.');
      }

      setState((prev: AuthState) => ({ ...prev, loading: true }));
      const { user } = await authInstance().createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      if (user) {
        try {
          await user.updateProfile({
            displayName: data.displayName,
          });

          await createUserProfile(user.uid, {
            uid: user.uid,
            email: user.email,
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
            photoURL: user.photoURL,
            linkedAccounts: [],
          });
          // SKTaxi: 회원가입 직후 FCM 토큰 저장
          await ensureFcmTokenSaved();
        } catch (profileError) {
          console.error('프로필 생성 중 오류:', profileError);
          await user.delete();
          throw new Error('프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      await authInstance().signInWithEmailAndPassword(data.email, data.password);
      // SKTaxi: 로그인 성공 직후 FCM 토큰 저장
      await ensureFcmTokenSaved();
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      // SKTaxi: 단일기기 정책 - 로그아웃 시 현재 토큰을 제거
      await removeCurrentFcmToken().catch(() => {});
      await authInstance().signOut();
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      if (!validateEmail(data.email)) {
        throw new Error('성결대학교 이메일(@sungkyul.ac.kr)만 사용 가능합니다.');
      }
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      await authInstance().sendPasswordResetEmail(data.email);
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const linkSocialAccount = async (data: SocialSignInData) => {
    try {
      if (!state.user) {
        throw new Error('로그인이 필요합니다.');
      }
      setState((prev: AuthState) => ({ ...prev, loading: true }));
      const linkedAccount: LinkedAccount = {
        provider: data.provider,
        providerId: data.token,
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
      };
      const updatedLinkedAccounts = [
        ...(state.user.linkedAccounts || []),
        linkedAccount,
      ];
      await updateUserProfile(state.user.uid, {
        linkedAccounts: updatedLinkedAccounts,
      });
      setState((prev: AuthState) => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          linkedAccounts: updatedLinkedAccounts,
        } : null,
        loading: false,
      }));
    } catch (error: unknown) {
      setState((prev: AuthState) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    linkSocialAccount,
  };
}; 
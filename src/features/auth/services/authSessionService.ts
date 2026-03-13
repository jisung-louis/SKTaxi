import { Platform } from 'react-native';

import { getCurrentAppVersion } from '@/features/settings';
import {
  clearUserFcmTokens,
  createInitialUserProfile,
  DEFAULT_USER_DISPLAY_NAME,
  syncUserLoginMetadata,
} from '@/features/user';
import type {
  IUserRepository,
  UserProfile,
} from '@/features/user';
import { setUserId } from '@/shared/lib/analytics';
import type { User } from '@/shared/types/user';

import {
  AuthUser,
  GoogleSignInResult,
  IAuthRepository,
} from '../data/repositories/IAuthRepository';

export const setAnalyticsAuthUser = async (authUser: AuthUser | null) => {
  await setUserId(authUser?.uid ?? null);
};

export const buildFallbackUser = (authUser: AuthUser): User => ({
  uid: authUser.uid,
  email: authUser.email,
  displayName: DEFAULT_USER_DISPLAY_NAME,
  studentId: null,
  department: null,
  photoURL: authUser.photoURL,
  linkedAccounts: [],
  realname: null,
});

export const mergeProfileUser = (
  authUser: AuthUser,
  profile: UserProfile,
): User => ({
  ...profile,
  uid: authUser.uid,
  photoURL:
    profile.photoURL ??
    profile.photoUrl ??
    authUser.photoURL ??
    null,
}) as User;

export const syncLoginMetadata = async (
  userRepository: IUserRepository,
  uid: string,
) => {
  const currentVersion = getCurrentAppVersion();

  await syncUserLoginMetadata({
    currentVersion,
    platformOS: Platform.OS,
    userId: uid,
    userRepository,
  }).catch(() => {});
};

const assertAllowedDomain = async (
  authRepository: IAuthRepository,
  authUser: AuthUser,
) => {
  if (authUser.email && !authUser.email.endsWith('@sungkyul.ac.kr')) {
    await authRepository.signOut();
    throw {
      code: 'auth/domain-restricted',
      message:
        '성결대학교 이메일(@sungkyul.ac.kr)만 사용 가능합니다.',
    };
  }
};

export const finalizeGoogleSignIn = async ({
  authRepository,
  result,
  userRepository,
}: {
  authRepository: IAuthRepository;
  result: GoogleSignInResult;
  userRepository: IUserRepository;
}) => {
  await assertAllowedDomain(authRepository, result.user);

  if (result.isNewUser) {
    await createInitialUserProfile(userRepository, result.user);
  }

  await syncLoginMetadata(userRepository, result.user.uid);

  return result.isNewUser;
};

export const removeAuthSessionFcmToken = async (
  authRepository: IAuthRepository,
  userRepository: IUserRepository,
) => {
  const currentUser = authRepository.getCurrentUser();
  if (!currentUser) {
    return;
  }

  await clearUserFcmTokens({
    userId: currentUser.uid,
    userRepository,
  });
};

export const mapAuthActionError = (error: any) => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'auth/cancelled' || message.includes('취소')) {
    return {
      code: 'auth/cancelled',
      message: '로그인을 취소했어요.',
    };
  }

  if (message.includes('@sungkyul.ac.kr')) {
    return error;
  }

  if (code.includes('network')) {
    return {
      code: 'auth/network',
      message: '네트워크 연결을 확인한 후 다시 시도해주세요.',
    };
  }

  return {
    code: code || 'auth/unknown',
    message: message || '잠시 후 다시 시도해주세요.',
  };
};

export const mapEmailPasswordSignInError = (error: any) => {
  const firebaseCode = error?.context?.firebaseCode || error?.code;

  const errorMap: Record<string, string> = {
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
    'auth/invalid-credential':
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
  };

  return new Error(errorMap[firebaseCode] || '로그인에 실패했습니다.');
};

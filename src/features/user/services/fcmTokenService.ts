import {
  getCurrentFcmToken,
  subscribeMessagingTokenRefresh,
} from '@/shared/lib/firebase/messaging';

import type { IUserRepository } from '../data/repositories/IUserRepository';

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const loadCurrentFcmToken = async (
  maxTries = 3,
  delayMs = 800,
): Promise<string | null> => {
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    try {
      const token = await getCurrentFcmToken();
      if (token) {
        return token;
      }
    } catch {
      // 실패 시 재시도
    }

    await delay(delayMs);
  }

  return null;
};

export const saveUserFcmToken = async ({
  userId,
  userRepository,
}: {
  userId: string;
  userRepository: IUserRepository;
}): Promise<void> => {
  try {
    const token = await loadCurrentFcmToken();
    if (!token) {
      return;
    }

    await userRepository.saveFcmToken(userId, token);
  } catch (error) {
    console.warn('ensureFcmTokenSaved failed:', error);
  }
};

export const subscribeUserFcmTokenRefresh = ({
  userId,
  userRepository,
}: {
  userId: string;
  userRepository: IUserRepository;
}) =>
  subscribeMessagingTokenRefresh(async token => {
    try {
      await userRepository.saveFcmToken(userId, token);
    } catch (error) {
      console.warn('onTokenRefresh update failed:', error);
    }
  });

export const clearUserFcmTokens = async ({
  userId,
  userRepository,
}: {
  userId: string;
  userRepository: IUserRepository;
}): Promise<void> => {
  try {
    await userRepository.clearFcmTokens(userId);
    console.log('✅ FCM 토큰 삭제 완료');
  } catch (error) {
    console.warn('FCM 토큰 삭제 실패:', error);
  }
};

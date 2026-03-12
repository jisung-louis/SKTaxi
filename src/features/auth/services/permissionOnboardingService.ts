import {
  completeUserPermissionOnboarding,
  saveUserFcmToken,
} from '@/features/user';
import type { IUserRepository } from '@/features/user';

const COMPLETION_DELAY_MS = 1000;

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const completePermissionOnboarding = async ({
  completeOnboarding,
  userId,
  userRepository,
}: {
  completeOnboarding: () => void;
  userId?: string;
  userRepository: IUserRepository;
}) => {
  try {
    if (userId) {
      await saveUserFcmToken({
        userId,
        userRepository,
      });
    }
    await delay(COMPLETION_DELAY_MS);

    if (userId) {
      await completeUserPermissionOnboarding({
        userId,
        userRepository,
      });
    }
  } catch (error) {
    console.warn('권한 온보딩 완료 처리 실패:', error);
    await delay(COMPLETION_DELAY_MS);
  } finally {
    completeOnboarding();
  }
};

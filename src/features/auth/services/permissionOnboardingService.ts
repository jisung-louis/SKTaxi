import {
  completeUserPermissionOnboarding,
} from '@/features/user';
import type { IUserRepository } from '@/features/user';
import {
  saveMemberFcmToken,
  type IMemberRepository,
} from '@/features/member';

const COMPLETION_DELAY_MS = 1000;

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const completePermissionOnboarding = async ({
  completeOnboarding,
  userId,
  memberRepository,
  userRepository,
}: {
  completeOnboarding: () => void;
  userId?: string;
  memberRepository: IMemberRepository;
  userRepository: IUserRepository;
}) => {
  try {
    if (userId) {
      await saveMemberFcmToken({
        memberRepository,
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

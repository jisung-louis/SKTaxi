import { useEffect } from 'react';

import { useUserRepository } from '@/features/user/hooks/useUserRepository';

import { PermissionOnboardingStep } from '../model/types';
import { completePermissionOnboarding } from '../services/permissionOnboardingService';
import { useAuth } from './useAuth';

export const usePermissionOnboarding = (
  currentStep: PermissionOnboardingStep,
  completeOnboarding: () => void,
) => {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  useEffect(() => {
    if (currentStep !== 'complete') {
      return;
    }

    let cancelled = false;

    const handleComplete = async () => {
      await completePermissionOnboarding({
        completeOnboarding: () => {
          if (!cancelled) {
            completeOnboarding();
          }
        },
        userId: user?.uid,
        userRepository,
      });
    };

    handleComplete().catch(error => {
      console.warn('권한 온보딩 완료 처리 실패:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [completeOnboarding, currentStep, user?.uid, userRepository]);
};

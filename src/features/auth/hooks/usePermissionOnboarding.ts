import {useCallback, useState} from 'react';

import {useMemberRepository} from '@/di';
import {useUserRepository} from '@/features/user';

import {completePermissionOnboarding} from '../services/permissionOnboardingService';
import {useAuth} from './useAuth';

export const usePermissionOnboarding = () => {
  const {user} = useAuth();
  const memberRepository = useMemberRepository();
  const userRepository = useUserRepository();
  const [completing, setCompleting] = useState(false);

  const finalizeOnboarding = useCallback(
    async (completeOnboarding: () => void) => {
      try {
        setCompleting(true);
        await completePermissionOnboarding({
          completeOnboarding,
          userId: user?.uid,
          memberRepository,
          userRepository,
        });
      } finally {
        setCompleting(false);
      }
    },
    [memberRepository, user?.uid, userRepository],
  );

  return {
    completing,
    finalizeOnboarding,
  };
};

import {useCallback, useState} from 'react';

import {useMemberRepository} from '@/di';

import {completePermissionOnboarding} from '../services/permissionOnboardingService';
import {useAuth} from './useAuth';

export const usePermissionOnboarding = () => {
  const {refreshCurrentUser, user} = useAuth();
  const memberRepository = useMemberRepository();
  const [completing, setCompleting] = useState(false);

  const finalizeOnboarding = useCallback(
    async (completeOnboarding: () => void) => {
      try {
        setCompleting(true);
        await completePermissionOnboarding({
          completeOnboarding,
          refreshCurrentUser,
          userId: user?.uid,
          memberRepository,
        });
      } finally {
        setCompleting(false);
      }
    },
    [memberRepository, refreshCurrentUser, user?.uid],
  );

  return {
    completing,
    finalizeOnboarding,
  };
};

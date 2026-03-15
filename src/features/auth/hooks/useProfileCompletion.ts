import { useMemo } from 'react';

import { useAuth } from './useAuth';

const DEFAULT_DISPLAY_NAME = '스쿠리 유저';

export const useProfileCompletion = () => {
  const { user } = useAuth();

  const isProfileComplete = useMemo(() => {
    if (!user) {
      return false;
    }

    return Boolean(
      user.studentId &&
        user.displayName &&
        user.department &&
        user.displayName !== DEFAULT_DISPLAY_NAME,
    );
  }, [user]);

  return {
    isProfileComplete,
    needsProfile: Boolean(user) && !isProfileComplete,
  };
};

import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const useProfileCompletion = () => {
  const { user } = useAuth();
  
  const isProfileComplete = useMemo(() => {
    if (!user) return false;
    return !!(user.studentId && user.displayName && user.displayName !== '스쿠리 유저');
  }, [user]);
  
  const needsProfile = !!user && !isProfileComplete;
  
  return { isProfileComplete, needsProfile };
};

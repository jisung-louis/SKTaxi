import { useAuth, useProfileCompletion } from '@/features/auth';

export type AuthEntryRoute =
  | 'loading'
  | 'auth'
  | 'completeProfile'
  | 'permissionOnboarding'
  | 'main';

export const useAuthEntryGuard = () => {
  const authState = useAuth();
  const { needsProfile } = useProfileCompletion();
  const permissionsComplete = Boolean(
    authState.user?.onboarding?.permissionsComplete,
  );

  let route: AuthEntryRoute = 'main';
  if (authState.loading) {
    route = 'loading';
  } else if (!authState.user) {
    route = 'auth';
  } else if (needsProfile) {
    route = 'completeProfile';
  } else if (!permissionsComplete) {
    route = 'permissionOnboarding';
  }

  return {
    authState,
    guardResult: {
      needsProfile,
      permissionsComplete,
      route,
    },
  };
};

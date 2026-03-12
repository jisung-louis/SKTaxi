import { useAuthRepository } from '@/di';
import { getUserLoginProvider } from '@/features/user';

export const useAuthLoginProvider = () => {
  const authRepository = useAuthRepository();
  const currentUser = authRepository.getCurrentUser();

  return getUserLoginProvider(currentUser?.providerId);
};

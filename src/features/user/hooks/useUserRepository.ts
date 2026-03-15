import { useUserRepository as useLegacyUserRepository } from '@/di';

import { IUserRepository } from '../data/repositories/IUserRepository';

export const useUserRepository = (): IUserRepository => {
  return useLegacyUserRepository();
};


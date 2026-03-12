import { usePartyRepository as useLegacyPartyRepository } from '@/di';

import { IPartyRepository } from '../data/repositories/IPartyRepository';

export const usePartyRepository = (): IPartyRepository => {
  return useLegacyPartyRepository();
};

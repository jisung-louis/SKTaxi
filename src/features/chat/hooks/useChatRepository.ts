import { useChatRepository as useLegacyChatRepository } from '@/di';

import type { IChatRepository } from '../data/repositories/IChatRepository';

export const useChatRepository = (): IChatRepository => {
  return useLegacyChatRepository();
};

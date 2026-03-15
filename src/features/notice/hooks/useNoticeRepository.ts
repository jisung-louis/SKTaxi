import { useRepositories } from '@/di';

import type { INoticeRepository } from '../data/repositories/INoticeRepository';

export const useNoticeRepository = (): INoticeRepository => {
  return useRepositories().noticeRepository;
};

import { useNotificationActionRepository as useLegacyNotificationActionRepository } from '@/di/useRepository';

import { INotificationActionRepository } from '../data/repositories/INotificationActionRepository';

export const useNotificationActionRepository = (): INotificationActionRepository => {
  return useLegacyNotificationActionRepository();
};

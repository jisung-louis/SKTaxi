import { useNotificationActionRepository as useLegacyNotificationActionRepository } from '@/di/useRepository';
import { INotificationActionRepository } from '@/repositories/interfaces/INotificationActionRepository';

export const useNotificationActionRepository = (): INotificationActionRepository => {
  return useLegacyNotificationActionRepository();
};

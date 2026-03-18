import type {INotificationCenterRepository} from './INotificationCenterRepository';
import {MockNotificationCenterRepository} from './MockNotificationCenterRepository';

export const notificationCenterRepository: INotificationCenterRepository =
  new MockNotificationCenterRepository();

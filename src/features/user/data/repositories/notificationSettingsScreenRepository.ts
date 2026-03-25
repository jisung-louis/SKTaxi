import type {INotificationSettingsScreenRepository} from './INotificationSettingsScreenRepository';
import {SpringNotificationSettingsScreenRepository} from './SpringNotificationSettingsScreenRepository';

export const notificationSettingsScreenRepository: INotificationSettingsScreenRepository =
  new SpringNotificationSettingsScreenRepository();

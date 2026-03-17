import {MockNotificationSettingsScreenRepository} from './MockNotificationSettingsScreenRepository';

import type {INotificationSettingsScreenRepository} from './INotificationSettingsScreenRepository';

export const notificationSettingsScreenRepository: INotificationSettingsScreenRepository =
  new MockNotificationSettingsScreenRepository();

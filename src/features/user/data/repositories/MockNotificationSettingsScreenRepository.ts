import {notificationSettingsMockData} from '../../mocks/notificationSettings.mock';
import type {
  NotificationSettingKey,
  NotificationSettingsScreenSource,
} from '../../model/notificationSettingsSource';

import type {INotificationSettingsScreenRepository} from './INotificationSettingsScreenRepository';

const MOCK_DELAY_MS = 90;

const cloneSource = (
  source: NotificationSettingsScreenSource,
): NotificationSettingsScreenSource => ({
  ...source,
  items: source.items.map(item => ({...item})),
});

let notificationSettingsStore = cloneSource(notificationSettingsMockData);

export class MockNotificationSettingsScreenRepository
  implements INotificationSettingsScreenRepository
{
  async getNotificationSettings(): Promise<NotificationSettingsScreenSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return cloneSource(notificationSettingsStore);
  }

  async updateAllNotifications(
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    notificationSettingsStore = {
      ...notificationSettingsStore,
      allNotifications: enabled,
      items: notificationSettingsStore.items.map(item => ({
        ...item,
        enabled,
      })),
    };

    return cloneSource(notificationSettingsStore);
  }

  async updateNotificationSetting(
    key: NotificationSettingKey,
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    const nextItems = notificationSettingsStore.items.map(item =>
      item.key === key ? {...item, enabled} : item,
    );

    const allChildrenDisabled = nextItems.every(item => !item.enabled);

    notificationSettingsStore = {
      ...notificationSettingsStore,
      allNotifications: allChildrenDisabled
        ? false
        : notificationSettingsStore.allNotifications,
      items: nextItems,
    };

    return cloneSource(notificationSettingsStore);
  }
}

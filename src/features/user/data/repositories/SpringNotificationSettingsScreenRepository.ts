import {
  type IMemberRepository,
  SpringMemberRepository,
} from '@/features/member';

import type {
  NotificationSettingKey,
  NotificationSettingsScreenSource,
} from '../../model/notificationSettingsSource';
import {
  buildToggleAllNotificationsPatch,
  buildToggleNotificationSettingPatch,
  mapMemberNotificationSettingsToScreenSource,
  resolveMemberNotificationSettings,
} from '../../services/notificationSettingsService';
import type {INotificationSettingsScreenRepository} from './INotificationSettingsScreenRepository';

export class SpringNotificationSettingsScreenRepository
  implements INotificationSettingsScreenRepository
{
  constructor(
    private readonly memberRepository: IMemberRepository = new SpringMemberRepository(),
  ) {}

  async getNotificationSettings(): Promise<NotificationSettingsScreenSource> {
    const memberProfile = await this.memberRepository.getMyMemberProfile();
    return mapMemberNotificationSettingsToScreenSource(
      memberProfile.notificationSetting,
    );
  }

  async updateAllNotifications(
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource> {
    const memberProfile =
      await this.memberRepository.updateMyNotificationSettings(
        buildToggleAllNotificationsPatch(enabled),
      );

    return mapMemberNotificationSettingsToScreenSource(
      memberProfile.notificationSetting,
    );
  }

  async updateNotificationSetting(
    key: NotificationSettingKey,
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource> {
    const currentProfile = await this.memberRepository.getMyMemberProfile();
    const memberProfile =
      await this.memberRepository.updateMyNotificationSettings(
        buildToggleNotificationSettingPatch({
          currentSettings: resolveMemberNotificationSettings(
            currentProfile.notificationSetting,
          ),
          enabled,
          key,
        }),
      );

    return mapMemberNotificationSettingsToScreenSource(
      memberProfile.notificationSetting,
    );
  }
}

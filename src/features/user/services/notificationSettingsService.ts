import type {
  MemberNotificationSetting,
  UpdateMemberNotificationSettingsInput,
} from '@/features/member';

import type {
  NotificationSettingKey,
  NotificationSettingsScreenSource,
} from '../model/notificationSettingsSource';

export const DEFAULT_MEMBER_NOTIFICATION_SETTINGS: MemberNotificationSetting = {
  allNotifications: true,
  partyNotifications: true,
  noticeNotifications: true,
  boardLikeNotifications: true,
  commentNotifications: true,
  bookmarkedPostCommentNotifications: true,
  systemNotifications: true,
  academicScheduleNotifications: true,
  academicScheduleDayBeforeEnabled: true,
  academicScheduleAllEventsEnabled: false,
  noticeNotificationsDetail: {},
};

export const NOTIFICATION_SETTING_KEYS: NotificationSettingKey[] = [
  'partyNotifications',
  'noticeNotifications',
  'boardLikeNotifications',
  'commentNotifications',
  'bookmarkedPostCommentNotifications',
  'systemNotifications',
];

export const resolveMemberNotificationSettings = (
  settings?: MemberNotificationSetting | null,
): MemberNotificationSetting => ({
  ...DEFAULT_MEMBER_NOTIFICATION_SETTINGS,
  ...settings,
  noticeNotificationsDetail: {
    ...DEFAULT_MEMBER_NOTIFICATION_SETTINGS.noticeNotificationsDetail,
    ...(settings?.noticeNotificationsDetail ?? {}),
  },
});

const areAllVisibleNotificationsDisabled = (
  settings: MemberNotificationSetting,
) => NOTIFICATION_SETTING_KEYS.every(key => !settings[key]);

export const mapMemberNotificationSettingsToScreenSource = (
  settings?: MemberNotificationSetting | null,
): NotificationSettingsScreenSource => {
  const resolved = resolveMemberNotificationSettings(settings);
  const allNotifications = !areAllVisibleNotificationsDisabled(resolved);

  return {
    allNotifications,
    items: NOTIFICATION_SETTING_KEYS.map(key => ({
      enabled: Boolean(resolved[key]),
      key,
    })),
  };
};

export const buildToggleAllNotificationsPatch = (
  enabled: boolean,
): UpdateMemberNotificationSettingsInput => {
  const patch: UpdateMemberNotificationSettingsInput = {
    allNotifications: enabled,
  };

  NOTIFICATION_SETTING_KEYS.forEach(key => {
    patch[key] = enabled;
  });

  return patch;
};

export const buildToggleNotificationSettingPatch = ({
  currentSettings,
  enabled,
  key,
}: {
  currentSettings?: MemberNotificationSetting | null;
  enabled: boolean;
  key: NotificationSettingKey;
}): UpdateMemberNotificationSettingsInput => {
  const resolved = resolveMemberNotificationSettings(currentSettings);
  const nextSettings: MemberNotificationSetting = {
    ...resolved,
    [key]: enabled,
  };

  return {
    [key]: enabled,
    allNotifications: !areAllVisibleNotificationsDisabled(nextSettings),
  };
};

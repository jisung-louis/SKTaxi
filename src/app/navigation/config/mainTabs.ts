import type { MainTabParamList } from '../types';

export const MAIN_TAB_LABELS: Record<keyof MainTabParamList, string> = {
  CampusTab: '캠퍼스',
  TaxiTab: '택시',
  NoticeTab: '공지',
  CommunityTab: '커뮤니티',
};

export const HIDDEN_BOTTOM_TAB_SCREENS: Record<
  keyof MainTabParamList,
  string[]
> = {
  TaxiTab: ['Recruit', 'MapSearch', 'Chat'],
  CampusTab: [
    'Notification',
    'Setting',
    'Profile',
    'ProfileEdit',
    'AppNotice',
    'AppNoticeDetail',
    'AccountModification',
    'NotificationSettings',
    'Inquiries',
    'TermsOfUse',
    'PrivacyPolicy',
    'CafeteriaDetail',
    'AcademicCalendarDetail',
    'TimetableDetail',
    'MinecraftDetail',
    'MinecraftMapDetail',
  ],
  NoticeTab: ['NoticeDetail', 'NoticeDetailWebView'],
  CommunityTab: ['BoardDetail', 'BoardWrite', 'BoardEdit', 'ChatDetail'],
};

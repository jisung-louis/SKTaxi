import { NavigatorScreenParams } from '@react-navigation/native';

import type { BoardStackParamList } from '@/features/board';
import type { ChatStackParamList } from '@/features/chat';
import type { NoticeStackParamList } from '@/features/notice';
import type { TaxiStackParamList } from '@/features/taxi';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  CompleteProfile: undefined;
  PermissionOnboarding: undefined;
  TermsOfUseForAuth: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TaxiTab: NavigatorScreenParams<TaxiStackParamList>;
  NoticeTab: NavigatorScreenParams<NoticeStackParamList>;
  BoardTab: NavigatorScreenParams<BoardStackParamList>;
  ChatTab: NavigatorScreenParams<ChatStackParamList>;
};
export type {
  BoardStackParamList,
} from '@/features/board';
export type { ChatStackParamList } from '@/features/chat';
export type { NoticeStackParamList } from '@/features/notice';
export type { TaxiStackParamList } from '@/features/taxi';

export type HomeStackParamList = {
  HomeMain: undefined;
  Notification: undefined;
  Setting: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  AppNotice: undefined;
  AppNoticeDetail: { noticeId: string };
  AccountModification: undefined;
  NotificationSettings: undefined;
  Inquiries: { type?: string };
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  CafeteriaDetail: { scrollToCategory?: string };
  AcademicCalendarDetail: undefined;
  TimetableDetail: { mode?: 'edit' };
  MinecraftDetail: undefined;
  MinecraftMapDetail: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  AccountGuide: undefined;
};

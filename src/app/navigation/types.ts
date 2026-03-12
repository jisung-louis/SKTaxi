import { NavigatorScreenParams } from '@react-navigation/native';

import type { BoardStackParamList } from '@/features/board';
import type { ChatStackParamList } from '@/features/chat';
import type { NoticeStackParamList } from '@/features/notice';
import { Party } from '@/types/party';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  CompleteProfile: undefined;
  PermissionOnboarding: undefined;
  TermsOfUseForAuth: undefined;
};

export type MainTabParamList = {
  홈: NavigatorScreenParams<HomeStackParamList>;
  택시: NavigatorScreenParams<TaxiStackParamList>;
  공지: NavigatorScreenParams<NoticeStackParamList>;
  게시판: NavigatorScreenParams<BoardStackParamList>;
  채팅: NavigatorScreenParams<ChatStackParamList>;
};

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: { party: Party; requestId: string };
  Recruit: undefined;
  MapSearch: {
    type: 'departure' | 'destination';
    onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  };
  Chat: { partyId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Notification: undefined;
  Setting: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  AppNotice: undefined;
  AppNoticeDetail: { noticeId: string };
  AccountModification: undefined;
  NotificationSetting: undefined;
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

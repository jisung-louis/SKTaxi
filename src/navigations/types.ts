import { NavigatorScreenParams } from '@react-navigation/native';
import { Party } from '../types/party';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  My: NavigatorScreenParams<MyStackParamList>;
  Auth: undefined;
  CompleteProfile: undefined;
  PermissionOnboarding: undefined;
  TermsOfUseForAuth: undefined;
};

export type MainTabParamList = {
  캠퍼스: NavigatorScreenParams<CampusStackParamList>;
  택시: NavigatorScreenParams<TaxiStackParamList>;
  공지: NavigatorScreenParams<NoticeStackParamList>;
  커뮤니티: NavigatorScreenParams<CommunityStackParamList>;
};

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: { party: Party; requestId: string }; // SKTaxi: 요청 문서 id 추가 전달
  Recruit: undefined;
  MapSearch: {
    type: 'departure' | 'destination';
    onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  };
  Chat: { partyId: string };
};

export type CampusStackParamList = {
  CampusMain: undefined;
  Notification: undefined;
  Setting: undefined;
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

export type NoticeStackParamList = {
  NoticeMain: undefined;
  NoticeDetail: { noticeId: string };
  NoticeDetailWebView: { noticeId: string };
};

export type CommunityMainParams = {
  searchText?: string;
  fromHashtag?: boolean;
};

export type CommunityStackParamList = {
  CommunityMain: CommunityMainParams | undefined;
  CommunityChatList: undefined;
  BoardDetail: { postId: string };
  BoardWrite: undefined;
  BoardEdit: { postId: string };
  ChatDetail: { chatRoomId: string };
};

export type MyStackParamList = {
  MyMain: undefined;
  Setting: undefined;
  ProfileEdit: undefined;
  AppNotice: undefined;
  AppNoticeDetail: { noticeId: string };
  AccountModification: undefined;
  NotificationSetting: undefined;
  Inquiries: { type?: string };
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
};

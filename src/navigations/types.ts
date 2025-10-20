import { NavigatorScreenParams } from '@react-navigation/native';
import { Party } from '../types/party';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
};

export type MainTabParamList = {
  홈: NavigatorScreenParams<HomeStackParamList>;
  택시: NavigatorScreenParams<TaxiStackParamList>;
  게시판: NavigatorScreenParams<BoardStackParamList>;
  공지: NavigatorScreenParams<NoticeStackParamList>;
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

export type HomeStackParamList = {
  HomeMain: undefined;
  Notification: undefined;
  Setting: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  AppNotice: undefined;
  AccountModification: undefined;
  NotificationSetting: undefined;
  Inquiries: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
}; 

export type BoardStackParamList = {
  BoardMain: undefined;
  BoardDetail: { postId: string };
  BoardWrite: undefined;
  BoardEdit: { postId: string };
};

export type NoticeStackParamList = {
  NoticeMain: undefined;
  NoticeDetail: { noticeId: string };
  NoticeDetailWebView: { noticeId: string };
};
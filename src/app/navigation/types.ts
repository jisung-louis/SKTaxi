import { NavigatorScreenParams } from '@react-navigation/native';

import type { BoardStackParamList } from '@/features/board';
import type { ChatStackParamList } from '@/features/chat';
import type { NoticeStackParamList } from '@/features/notice';
import type { TaxiStackParamList } from '@/features/taxi';
import type {TimetableDetailViewMode} from '@/features/timetable/model/timetableDetailViewData';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  CompleteProfile: undefined;
  PermissionOnboarding: undefined;
  TermsOfUseForAuth: undefined;
};

export type CommunityStackParamList =
  BoardStackParamList & ChatStackParamList;

export type MainTabParamList = {
  CampusTab: NavigatorScreenParams<CampusStackParamList>;
  TaxiTab: NavigatorScreenParams<TaxiStackParamList>;
  NoticeTab: NavigatorScreenParams<NoticeStackParamList>;
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
};
export type {
  BoardStackParamList,
} from '@/features/board';
export type { ChatStackParamList } from '@/features/chat';
export type { NoticeStackParamList } from '@/features/notice';
export type { TaxiStackParamList } from '@/features/taxi';

export type CampusStackParamList = {
  CampusMain: undefined;
  Notification: undefined;
  Setting: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  MyPosts: undefined;
  Bookmarks:
    | {
        initialTab?: 'community' | 'notice';
      }
    | undefined;
  TaxiHistory: undefined;
  AppNotice: undefined;
  AppNoticeDetail: { noticeId: string };
  AccountModification: undefined;
  NotificationSettings: undefined;
  Inquiries: { type?: string };
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  CafeteriaDetail: { scrollToCategory?: string };
  AcademicCalendarDetail:
    | {
        initialDate?: string;
        scheduleId?: string;
      }
    | undefined;
  TimetableDetail:
    | {
        initialView?: TimetableDetailViewMode;
        mode?: 'edit';
      }
    | undefined;
  MinecraftDetail: undefined;
  MinecraftMapDetail: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  AccountGuide: undefined;
};

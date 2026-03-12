import { UserDoc } from '@/types/firestore';

export interface UserAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

export interface UserNotificationSettings {
  allNotifications: boolean;
  partyNotifications: boolean;
  noticeNotifications: boolean;
  boardLikeNotifications: boolean;
  boardCommentNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
  noticeNotificationsDetail?: Record<string, boolean>;
}

export interface UserOnboardingState {
  permissionsComplete: boolean;
}

export interface UserAgreements {
  termsAccepted: boolean;
  ageConfirmed: boolean;
  termsVersion: string;
  acceptedAt: string;
}

export interface UserProfile extends UserDoc {
  id: string;
  uid?: string;
  email?: string | null;
  studentId?: string | null;
  department?: string | null;
  phoneNumber?: string | null;
  joinedAt?: unknown;
  isVerified?: boolean;
  bio?: string | null;
  isAdmin?: boolean;
  photoURL?: string | null;
  photoUrl?: string | null;
  linkedAccounts?: Array<{
    provider: string;
    providerId: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  }>;
  realname?: string | null;
  account?: UserAccountInfo | null;
  accountInfo?: UserAccountInfo | null;
  notificationSettings?: Partial<UserNotificationSettings>;
  onboarding?: UserOnboardingState;
  agreements?: UserAgreements;
  lastLogin?: unknown;
  currentVersion?: string;
  lastLoginOS?: string;
}

export type UserDisplayNameMap = Record<string, string>;

export type UserLoginProvider = 'google' | 'email' | 'unknown';


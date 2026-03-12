import { setUserProperties } from '@/shared/lib/analytics';
import { User } from '@/types/auth';

import { leaveDepartmentRoom } from '../data/departmentChatRoom';
import { withdrawUser } from '../data/withdrawUser';
import { IUserRepository } from '../data/repositories/IUserRepository';
import {
  UserAccountInfo,
  UserLoginProvider,
  UserNotificationSettings,
  UserProfile,
} from '../model/types';

export const DEFAULT_USER_DISPLAY_NAME = '스쿠리 유저';

export const DEFAULT_NOTIFICATION_SETTINGS: UserNotificationSettings = {
  allNotifications: true,
  partyNotifications: true,
  noticeNotifications: true,
  boardLikeNotifications: true,
  boardCommentNotifications: true,
  systemNotifications: true,
  marketingNotifications: false,
  noticeNotificationsDetail: {},
};

const TERMS_VERSION = '2025-10-29';

export interface AuthUserSeed {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const getUserLoginProvider = (
  providerId?: string | null,
): UserLoginProvider => {
  if (providerId === 'google.com') {
    return 'google';
  }

  if (providerId === 'password') {
    return 'email';
  }

  return 'unknown';
};

export const resolveUserAccountInfo = (
  profile?: UserProfile | null,
): UserAccountInfo | null => {
  const accountInfo = profile?.accountInfo ?? profile?.account;

  if (!accountInfo) {
    return null;
  }

  return {
    bankName: accountInfo.bankName || '',
    accountNumber: accountInfo.accountNumber || '',
    accountHolder: accountInfo.accountHolder || '',
    hideName: Boolean(accountInfo.hideName),
  };
};

export const resolveNotificationSettings = (
  profile?: UserProfile | null,
): UserNotificationSettings => {
  const savedSettings = profile?.notificationSettings ?? {};

  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...savedSettings,
    noticeNotificationsDetail: {
      ...DEFAULT_NOTIFICATION_SETTINGS.noticeNotificationsDetail,
      ...(savedSettings.noticeNotificationsDetail ?? {}),
    },
  };
};

export const updateUserNotificationSettings = async ({
  currentSettings,
  patch,
  userId,
  userRepository,
}: {
  currentSettings: UserNotificationSettings;
  patch: Partial<UserNotificationSettings>;
  userId: string;
  userRepository: IUserRepository;
}) => {
  const nextSettings: UserNotificationSettings = {
    ...currentSettings,
    ...patch,
    noticeNotificationsDetail: {
      ...(currentSettings.noticeNotificationsDetail ?? {}),
      ...(patch.noticeNotificationsDetail ?? {}),
    },
  };

  if (patch.allNotifications === false) {
    nextSettings.partyNotifications = false;
    nextSettings.noticeNotifications = false;
    nextSettings.boardLikeNotifications = false;
    nextSettings.boardCommentNotifications = false;
    nextSettings.systemNotifications = false;
    nextSettings.marketingNotifications = false;
  }

  if (patch.allNotifications === true) {
    nextSettings.partyNotifications = true;
    nextSettings.noticeNotifications = true;
    nextSettings.boardLikeNotifications = true;
    nextSettings.boardCommentNotifications = true;
    nextSettings.systemNotifications = true;
    nextSettings.marketingNotifications = true;
  }

  await userRepository.updateUserProfile(userId, {
    notificationSettings: nextSettings,
  });

  return nextSettings;
};

export const saveUserAccountInfo = async ({
  accountInfo,
  userId,
  userRepository,
}: {
  accountInfo: UserAccountInfo;
  userId: string;
  userRepository: IUserRepository;
}) => {
  await userRepository.updateUserProfile(userId, {
    accountInfo: {
      bankName: accountInfo.bankName,
      accountNumber: accountInfo.accountNumber,
      accountHolder: accountInfo.accountHolder,
      hideName: accountInfo.hideName,
    },
  });
};

export const deleteUserAccountInfo = async ({
  userId,
  userRepository,
}: {
  userId: string;
  userRepository: IUserRepository;
}) => {
  await userRepository.deleteAccountInfo(userId);
};

export const saveUserProfileChanges = async ({
  department,
  displayName,
  previousDepartment,
  studentId,
  userId,
  userRepository,
}: {
  department: string;
  displayName: string;
  previousDepartment?: string;
  studentId: string;
  userId: string;
  userRepository: IUserRepository;
}) => {
  const nextDisplayName = displayName.trim();
  const nextDepartment = department.trim();
  const nextStudentId = studentId.trim();
  const previous = previousDepartment?.trim();

  await userRepository.checkDisplayNameAvailable(nextDisplayName, userId);

  if (previous && previous !== nextDepartment) {
    await leaveDepartmentRoom(previous, userId);
  }

  await userRepository.updateUserProfile(userId, {
    displayName: nextDisplayName,
    studentId: nextStudentId,
    department: nextDepartment,
  });

  await setUserProperties({
    display_name: nextDisplayName,
    department: nextDepartment,
  });
};

export const createInitialUserProfile = async (
  userRepository: IUserRepository,
  authUser: AuthUserSeed,
) => {
  await userRepository.createUserProfile(authUser.uid, {
    uid: authUser.uid,
    email: authUser.email || '',
    displayName: DEFAULT_USER_DISPLAY_NAME,
    photoURL: authUser.photoURL,
    linkedAccounts: [
      {
        provider: 'google',
        providerId: authUser.uid,
        email: authUser.email || '',
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
      },
    ],
    studentId: null,
    realname: null,
    department: null,
  });
};

export const saveCompletedUserProfile = async ({
  user,
  userRepository,
  values,
}: {
  user: User | null;
  userRepository: IUserRepository;
  values: {
    ageConfirmed: boolean;
    department: string;
    displayName: string;
    studentId: string;
    termsAccepted: boolean;
  };
}) => {
  if (!user?.uid) {
    throw new Error('로그인이 필요합니다. 다시 로그인해 주세요.');
  }

  const displayName = values.displayName.trim();
  const studentId = values.studentId.trim();
  const department = values.department.trim();
  const agreements = {
    termsAccepted: true,
    ageConfirmed: true,
    termsVersion: TERMS_VERSION,
    acceptedAt: new Date().toISOString(),
  };

  await userRepository.checkDisplayNameAvailable(displayName, user.uid);

  const existing = await userRepository.getUserProfile(user.uid);
  if (!existing) {
    await userRepository.createUserProfile(user.uid, {
      uid: user.uid,
      email: user.email ?? null,
      displayName,
      studentId,
      department,
      photoURL: user.photoURL ?? null,
      onboarding: { permissionsComplete: false },
      agreements,
    });
  } else {
    await userRepository.updateUserProfile(user.uid, {
      displayName,
      studentId,
      department,
      agreements,
    });
  }

  await setUserProperties({
    display_name: displayName,
    department,
  });
};

export const syncUserLoginMetadata = async ({
  currentVersion,
  platformOS,
  userId,
  userRepository,
}: {
  currentVersion: string;
  platformOS: string;
  userId: string;
  userRepository: IUserRepository;
}) => {
  await userRepository.updateUserProfile(userId, {
    currentVersion,
    lastLogin: new Date(),
    lastLoginOS: platformOS,
  });
};

export const completeUserPermissionOnboarding = async ({
  userId,
  userRepository,
}: {
  userId: string;
  userRepository: IUserRepository;
}) => {
  await userRepository.updateUserProfile(userId, {
    onboarding: { permissionsComplete: true },
  });
};

export const withdrawCurrentUser = async ({
  password,
  userId,
}: {
  password?: string;
  userId: string;
}) => {
  await withdrawUser(userId, password);
};

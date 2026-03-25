import { getAuth } from '@react-native-firebase/auth';

import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type { IUserRepository } from './IUserRepository';
import type {
  UserDisplayNameMap,
  UserProfile,
} from '../../model/types';

const DEFAULT_NOTIFICATION_SETTINGS = {
  allNotifications: true,
  partyNotifications: true,
  noticeNotifications: true,
  boardLikeNotifications: true,
  boardCommentNotifications: true,
  systemNotifications: true,
  marketingNotifications: false,
  noticeNotificationsDetail: {},
};

const profileStore = new Map<string, UserProfile>();
const bookmarkStore = new Map<string, Set<string>>();
const profileSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<UserProfile | null>>
>();
const bookmarkSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<string[]>>
>();

const cloneProfile = (profile: UserProfile): UserProfile => ({
  ...profile,
  linkedAccounts: profile.linkedAccounts
    ? profile.linkedAccounts.map(account => ({ ...account }))
    : undefined,
  account: profile.account ? { ...profile.account } : profile.account,
  accountInfo: profile.accountInfo ? { ...profile.accountInfo } : profile.accountInfo,
  notificationSettings: profile.notificationSettings
    ? {
        ...profile.notificationSettings,
        noticeNotificationsDetail: {
          ...(profile.notificationSettings.noticeNotificationsDetail ?? {}),
        },
      }
    : undefined,
  onboarding: profile.onboarding ? { ...profile.onboarding } : undefined,
  agreements: profile.agreements ? { ...profile.agreements } : undefined,
  joinedAt: profile.joinedAt instanceof Date ? new Date(profile.joinedAt) : profile.joinedAt,
  lastLogin: profile.lastLogin instanceof Date ? new Date(profile.lastLogin) : profile.lastLogin,
});

const emitProfile = (userId: string) => {
  const profile = profileStore.get(userId) ?? null;
  profileSubscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData(profile ? cloneProfile(profile) : null);
  });
};

const emitBookmarks = (userId: string) => {
  const bookmarks = Array.from(bookmarkStore.get(userId) ?? []);
  bookmarkSubscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData([...bookmarks]);
  });
};

const buildFallbackDisplayName = (userId: string) => {
  if (!userId) {
    return '스쿠리 유저';
  }

  return `유저-${userId.slice(0, 4)}`;
};

const buildDefaultProfile = (userId: string): UserProfile => {
  const currentAuthUser = getAuth().currentUser;
  const isCurrentAuthUser = currentAuthUser?.uid === userId;

  return {
    id: userId,
    uid: userId,
    email: isCurrentAuthUser ? currentAuthUser?.email ?? null : null,
    displayName:
      (isCurrentAuthUser ? currentAuthUser?.displayName : null) ??
      buildFallbackDisplayName(userId),
    photoURL: isCurrentAuthUser ? currentAuthUser?.photoURL ?? null : null,
    photoUrl: isCurrentAuthUser ? currentAuthUser?.photoURL ?? null : null,
    linkedAccounts:
      isCurrentAuthUser && currentAuthUser?.email
        ? [
            {
              provider: 'google',
              providerId: userId,
              email: currentAuthUser.email,
              displayName: currentAuthUser.displayName,
              photoURL: currentAuthUser.photoURL,
            },
          ]
        : [],
    studentId: null,
    realname: null,
    department: null,
    onboarding: { permissionsComplete: false },
    notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
    createdAt: new Date(),
    joinedAt: new Date(),
    currentVersion: 'mock',
  };
};

const ensureProfile = (userId: string): UserProfile => {
  if (!profileStore.has(userId)) {
    profileStore.set(userId, buildDefaultProfile(userId));
  }

  return profileStore.get(userId)!;
};

const seedProfiles = () => {
  if (profileStore.size > 0) {
    return;
  }

  [
    { id: 'leader-1', displayName: '김성결', department: '컴퓨터공학과' },
    { id: 'leader-2', displayName: '박지은', department: '경영학과' },
    { id: 'leader-3', displayName: '강태완', department: '컴퓨터공학과' },
    { id: 'leader-4', displayName: '윤서연', department: '경영학과' },
    { id: 'mock-admin', displayName: '스쿠리 운영팀', department: '운영팀' },
    { id: 'current-user', displayName: '나', department: '컴퓨터공학과' },
  ].forEach(seed => {
    profileStore.set(seed.id, {
      ...buildDefaultProfile(seed.id),
      displayName: seed.displayName,
      department: seed.department,
      onboarding: { permissionsComplete: true },
    });
  });
};

seedProfiles();

export class MockUserRepository implements IUserRepository {
  subscribeToUserProfile(
    userId: string,
    callbacks: SubscriptionCallbacks<UserProfile | null>,
  ): Unsubscribe {
    const bucket = profileSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    profileSubscribers.set(userId, bucket);

    callbacks.onData(cloneProfile(ensureProfile(userId)));

    return () => {
      profileSubscribers.get(userId)?.delete(callbacks);
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return cloneProfile(ensureProfile(userId));
  }

  async getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap> {
    return userIds.reduce<UserDisplayNameMap>((accumulator, userId) => {
      const profile = profileStore.get(userId);
      accumulator[userId] = profile?.displayName || buildFallbackDisplayName(userId);
      return accumulator;
    }, {});
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const current = ensureProfile(userId);

    profileStore.set(userId, {
      ...current,
      ...updates,
      id: userId,
      uid: userId,
      notificationSettings: updates.notificationSettings
        ? {
            ...(current.notificationSettings ?? DEFAULT_NOTIFICATION_SETTINGS),
            ...updates.notificationSettings,
            noticeNotificationsDetail: {
              ...(current.notificationSettings?.noticeNotificationsDetail ?? {}),
              ...(updates.notificationSettings.noticeNotificationsDetail ?? {}),
            },
          }
        : current.notificationSettings,
    });

    emitProfile(userId);
  }

  async createUserProfile(
    userId: string,
    profile: Omit<UserProfile, 'id'>,
  ): Promise<void> {
    profileStore.set(userId, {
      ...profile,
      id: userId,
      uid: userId,
      notificationSettings: profile.notificationSettings
        ? {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...profile.notificationSettings,
          }
        : DEFAULT_NOTIFICATION_SETTINGS,
      onboarding: profile.onboarding ?? { permissionsComplete: false },
    });

    emitProfile(userId);
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    return Array.from(bookmarkStore.get(userId) ?? []);
  }

  async addBookmark(userId: string, postId: string): Promise<void> {
    const bookmarks = bookmarkStore.get(userId) ?? new Set<string>();
    bookmarks.add(postId);
    bookmarkStore.set(userId, bookmarks);
    emitBookmarks(userId);
  }

  async removeBookmark(userId: string, postId: string): Promise<void> {
    bookmarkStore.get(userId)?.delete(postId);
    emitBookmarks(userId);
  }

  subscribeToBookmarks(
    userId: string,
    callbacks: SubscriptionCallbacks<string[]>,
  ): Unsubscribe {
    const bucket = bookmarkSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    bookmarkSubscribers.set(userId, bucket);

    callbacks.onData(Array.from(bookmarkStore.get(userId) ?? []));

    return () => {
      bookmarkSubscribers.get(userId)?.delete(callbacks);
    };
  }

  async deleteAccountInfo(userId: string): Promise<void> {
    const profile = ensureProfile(userId);

    profileStore.set(userId, {
      ...profile,
      account: null,
      accountInfo: null,
    });

    emitProfile(userId);
  }

  async checkDisplayNameAvailable(
    displayName: string,
    excludeUserId?: string,
  ): Promise<void> {
    const normalized = displayName.trim().toLowerCase();

    const duplicatedProfile = Array.from(profileStore.values()).find(profile =>
      profile.id !== excludeUserId &&
      profile.displayName?.trim().toLowerCase() === normalized,
    );

    if (duplicatedProfile) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }
  }
}

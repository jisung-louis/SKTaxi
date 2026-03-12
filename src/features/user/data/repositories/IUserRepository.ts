import {
  UserDisplayNameMap,
  UserProfile,
} from '../../model/types';

export type Unsubscribe = () => void;

export interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError: (error: Error) => void;
}

export interface IUserRepository {
  subscribeToUserProfile(
    userId: string,
    callbacks: SubscriptionCallbacks<UserProfile | null>,
  ): Unsubscribe;

  getUserProfile(userId: string): Promise<UserProfile | null>;

  getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap>;

  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;

  createUserProfile(
    userId: string,
    profile: Omit<UserProfile, 'id'>,
  ): Promise<void>;

  saveFcmToken(userId: string, token: string): Promise<void>;

  removeFcmToken(userId: string, token: string): Promise<void>;

  clearFcmTokens(userId: string): Promise<void>;

  getUserBookmarks(userId: string): Promise<string[]>;

  addBookmark(userId: string, postId: string): Promise<void>;

  removeBookmark(userId: string, postId: string): Promise<void>;

  subscribeToBookmarks(
    userId: string,
    callbacks: SubscriptionCallbacks<string[]>,
  ): Unsubscribe;

  deleteAccountInfo(userId: string): Promise<void>;

  checkDisplayNameAvailable(
    displayName: string,
    excludeUserId?: string,
  ): Promise<void>;
}

import { Unsubscribe, SubscriptionCallbacks } from '@/api/types';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
}

export interface AuthRepositoryState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
}

export interface GoogleSignInResult {
  user: AuthUser;
  idToken: string;
  isNewUser: boolean;
}

export interface IAuthRepository {
  getCurrentUser(): AuthUser | null;

  subscribeToAuthState(
    callbacks: SubscriptionCallbacks<AuthUser | null>,
  ): Unsubscribe;

  signInWithGoogle(): Promise<GoogleSignInResult>;

  signOut(): Promise<void>;

  deleteAccount(): Promise<void>;

  refreshToken(forceRefresh?: boolean): Promise<string | null>;

  isEmailVerified(): boolean;

  resendVerificationEmail(): Promise<void>;

  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<AuthUser>;
}

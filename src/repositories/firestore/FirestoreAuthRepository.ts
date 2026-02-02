// SKTaxi: Auth Repository Firebase 구현체 - v22 Modular API

import {
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  IAuthRepository,
  AuthUser,
  GoogleSignInResult,
} from '../interfaces/IAuthRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../../api/types';
import { RepositoryError, RepositoryErrorCode } from '../../errors';

/**
 * Firebase 기반 Auth Repository 구현체
 */
export class FirestoreAuthRepository implements IAuthRepository {
  private readonly authInstance = getAuth();

  /**
   * Firebase User를 AuthUser로 변환
   */
  private toAuthUser(user: FirebaseAuthTypes.User | null): AuthUser | null {
    if (!user) {return null;}

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId || 'unknown',
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.toAuthUser(this.authInstance.currentUser);
  }

  subscribeToAuthState(
    callbacks: SubscriptionCallbacks<AuthUser | null>
  ): Unsubscribe {
    return onAuthStateChanged(this.authInstance, (user) => {
      try {
        callbacks.onData(this.toAuthUser(user));
      } catch (error) {
        callbacks.onError(error as Error);
      }
    });
  }

  async signInWithGoogle(): Promise<GoogleSignInResult> {
    try {
      // Google Sign-In 시작
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      // signInResult.data에서 idToken 추출 (최신 API)
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          'Google 로그인에 실패했습니다. (토큰 없음)'
        );
      }

      // Firebase credential 생성 및 로그인
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(this.authInstance, googleCredential);

      const user = this.toAuthUser(userCredential.user);
      if (!user) {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          'Google 로그인에 실패했습니다. (사용자 정보 없음)'
        );
      }

      return {
        user,
        idToken,
        isNewUser: userCredential.additionalUserInfo?.isNewUser || false,
      };
    } catch (error: any) {
      // 사용자가 취소한 경우
      if (error?.code === 'SIGN_IN_CANCELLED' || error?.code === '12501') {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          '로그인이 취소되었습니다.',
          { originalError: error }
        );
      }

      if (error instanceof RepositoryError) {
        throw error;
      }

      throw RepositoryError.fromFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      // Google Sign-Out (에러 무시)
      await GoogleSignin.signOut().catch(() => {});

      // Firebase Sign-Out
      await firebaseSignOut(this.authInstance);
    } catch (error: any) {
      throw RepositoryError.fromFirebaseError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      const user = this.authInstance.currentUser;
      if (!user) {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          '로그인된 사용자가 없습니다.'
        );
      }

      // Google 로그아웃 (에러 무시)
      await GoogleSignin.revokeAccess().catch(() => {});
      await GoogleSignin.signOut().catch(() => {});

      // Firebase 계정 삭제
      await user.delete();
    } catch (error: any) {
      throw RepositoryError.fromFirebaseError(error);
    }
  }

  async refreshToken(forceRefresh = false): Promise<string | null> {
    try {
      const user = this.authInstance.currentUser;
      if (!user) {return null;}

      return await user.getIdToken(forceRefresh);
    } catch (error: any) {
      throw RepositoryError.fromFirebaseError(error);
    }
  }

  isEmailVerified(): boolean {
    return this.authInstance.currentUser?.emailVerified || false;
  }

  async resendVerificationEmail(): Promise<void> {
    try {
      const user = this.authInstance.currentUser;
      if (!user) {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          '로그인된 사용자가 없습니다.'
        );
      }

      await user.sendEmailVerification();
    } catch (error: any) {
      throw RepositoryError.fromFirebaseError(error);
    }
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    try {
      const credential = await this.authInstance.signInWithEmailAndPassword(email, password);
      const user = this.toAuthUser(credential.user);
      if (!user) {
        throw new RepositoryError(
          RepositoryErrorCode.UNAUTHENTICATED,
          '로그인에 실패했습니다. (사용자 정보 없음)'
        );
      }
      return user;
    } catch (error: any) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw RepositoryError.fromFirebaseError(error);
    }
  }
}

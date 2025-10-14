export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  studentId: string | null;
  photoURL: string | null;
  linkedAccounts?: LinkedAccount[];
  account?: UserAccountInfo | null;
  realname?: string | null;
}

export interface LinkedAccount {
  provider: 'kakao' | 'naver' | 'apple';
  providerId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  studentId: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface SocialSignInData {
  provider: 'kakao' | 'naver' | 'apple';
  token: string;
  email: string;
  displayName?: string;
  photoURL?: string;
} 

export interface UserAccountInfo {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  hideName?: boolean;
}
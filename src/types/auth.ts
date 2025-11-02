export interface User {
  uid: string;
  email: string | null;
  displayName: string | null; // 회원가입 닉네임
  studentId: string | null;
  department: string | null;
  photoURL: string | null;
  linkedAccounts?: LinkedAccount[];
  account?: UserAccountInfo | null;
  realname?: string | null; // 계좌 예금주 이름
  onboarding?: {
    permissionsComplete: boolean;
  };
  joinedAt?: any;
}

export interface LinkedAccount {
  provider: 'google';
  providerId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// email/password 관련 타입 제거

export interface UserAccountInfo {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  hideName?: boolean;
}
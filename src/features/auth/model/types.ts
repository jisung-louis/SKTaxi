import { AuthState } from '@/types/auth';

export interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<{ firstLogin: boolean }>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthToken: () => Promise<string | null>;
}

export interface CompleteProfileFormValues {
  displayName: string;
  department: string;
  studentId: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
}

export type PermissionOnboardingStep =
  | 'intro'
  | 'notification'
  | 'att'
  | 'location'
  | 'complete';

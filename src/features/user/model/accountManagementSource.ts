export interface AccountManagementAccountSource {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  hideName: boolean;
}

export type AccountManagementSource = AccountManagementAccountSource;

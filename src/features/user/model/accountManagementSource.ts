export interface AccountManagementAccountSource {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  hideName: boolean;
}

export interface AccountManagementSource {
  account: AccountManagementAccountSource;
  bankNames: string[];
  infoLines: [string, string];
}

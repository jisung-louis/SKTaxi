export interface AccountManagementScreenViewData {
  accountHolder: string;
  accountNumber: string;
  bankNames: string[];
  hideName: boolean;
  infoLines: [string, string];
  isBankDropdownOpen: boolean;
  isSaveEnabled: boolean;
  selectedBankName: string;
}

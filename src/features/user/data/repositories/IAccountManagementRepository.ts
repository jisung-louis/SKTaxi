import type {AccountManagementSource, AccountManagementAccountSource} from '../../model/accountManagementSource';

export interface IAccountManagementRepository {
  getAccountManagement(): Promise<AccountManagementSource>;
  saveAccountManagement(
    account: AccountManagementAccountSource,
  ): Promise<AccountManagementSource>;
}

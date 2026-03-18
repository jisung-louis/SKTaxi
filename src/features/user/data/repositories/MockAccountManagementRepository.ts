import {accountManagementMockData} from '../../mocks/accountManagement.mock';
import type {
  AccountManagementAccountSource,
  AccountManagementSource,
} from '../../model/accountManagementSource';

import type {IAccountManagementRepository} from './IAccountManagementRepository';

const MOCK_DELAY_MS = 100;

let accountManagementStore: AccountManagementSource = {...accountManagementMockData};

const cloneSource = (
  source: AccountManagementSource,
): AccountManagementSource => ({
  ...source,
});

export class MockAccountManagementRepository
  implements IAccountManagementRepository
{
  async getAccountManagement(): Promise<AccountManagementSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return cloneSource(accountManagementStore);
  }

  async saveAccountManagement(
    account: AccountManagementAccountSource,
  ): Promise<AccountManagementSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    accountManagementStore = {...account};

    return cloneSource(accountManagementStore);
  }
}

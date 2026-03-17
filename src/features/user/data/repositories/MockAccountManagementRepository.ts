import {accountManagementMockData} from '../../mocks/accountManagement.mock';
import type {
  AccountManagementAccountSource,
  AccountManagementSource,
} from '../../model/accountManagementSource';

import type {IAccountManagementRepository} from './IAccountManagementRepository';

const MOCK_DELAY_MS = 100;

let accountManagementStore: AccountManagementSource = {
  account: {...accountManagementMockData.account},
  bankNames: [...accountManagementMockData.bankNames],
  infoLines: [...accountManagementMockData.infoLines] as [string, string],
};

const cloneSource = (
  source: AccountManagementSource,
): AccountManagementSource => ({
  account: {...source.account},
  bankNames: [...source.bankNames],
  infoLines: [...source.infoLines] as [string, string],
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

    accountManagementStore = {
      ...accountManagementStore,
      account: {...account},
    };

    return cloneSource(accountManagementStore);
  }
}

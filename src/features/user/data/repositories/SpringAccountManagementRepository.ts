import {
  memberApiClient,
  MemberApiClient,
} from '@/features/member/data/api/memberApiClient';

import type {
  AccountManagementAccountSource,
  AccountManagementSource,
} from '../../model/accountManagementSource';
import type {IAccountManagementRepository} from './IAccountManagementRepository';

const toAccountManagementSource = (
  account?: Partial<AccountManagementAccountSource> | null,
): AccountManagementSource => ({
  accountHolder: account?.accountHolder ?? '',
  accountNumber: account?.accountNumber ?? '',
  bankName: account?.bankName ?? '',
  hideName: Boolean(account?.hideName),
});

export class SpringAccountManagementRepository
  implements IAccountManagementRepository
{
  constructor(
    private readonly memberClient: MemberApiClient = memberApiClient,
  ) {}

  async getAccountManagement(): Promise<AccountManagementSource> {
    const response = await this.memberClient.getMyMemberProfile();

    return toAccountManagementSource(response.data.bankAccount);
  }

  async saveAccountManagement(
    account: AccountManagementAccountSource,
  ): Promise<AccountManagementSource> {
    const response = await this.memberClient.updateMyBankAccount(account);

    return toAccountManagementSource(response.data.bankAccount);
  }
}

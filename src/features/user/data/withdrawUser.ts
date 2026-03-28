import {memberApiClient} from '@/features/member/data/api/memberApiClient';

export async function withdrawUser(): Promise<void> {
  await memberApiClient.deleteMyAccount();
}

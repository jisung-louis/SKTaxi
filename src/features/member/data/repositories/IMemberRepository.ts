import type {
  MemberFcmTokenPlatform,
  MemberProfile,
  UpdateMemberBankAccountInput,
  UpdateMemberProfileInput,
} from '../../model/types';

export interface IMemberRepository {
  ensureMember(): Promise<MemberProfile>;

  getMyMemberProfile(): Promise<MemberProfile>;

  updateMyProfile(profile: UpdateMemberProfileInput): Promise<MemberProfile>;

  updateMyBankAccount(
    account: UpdateMemberBankAccountInput,
  ): Promise<MemberProfile>;

  registerFcmToken(
    token: string,
    platform: MemberFcmTokenPlatform,
  ): Promise<void>;

  deleteFcmToken(token: string): Promise<void>;
}

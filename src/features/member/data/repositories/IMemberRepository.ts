import type {
  MemberFcmTokenPlatform,
  MemberProfile,
  UpdateMemberProfileInput,
} from '../../model/types';

export interface IMemberRepository {
  ensureMember(): Promise<MemberProfile>;

  getMyMemberProfile(): Promise<MemberProfile>;

  updateMyProfile(profile: UpdateMemberProfileInput): Promise<MemberProfile>;

  registerFcmToken(
    token: string,
    platform: MemberFcmTokenPlatform,
  ): Promise<void>;

  deleteFcmToken(token: string): Promise<void>;
}

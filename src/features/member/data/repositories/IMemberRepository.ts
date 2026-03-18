import type {
  MemberFcmTokenPlatform,
  MemberProfile,
} from '../../model/types';

export interface IMemberRepository {
  ensureMember(): Promise<MemberProfile>;

  getMyMemberProfile(): Promise<MemberProfile>;

  registerFcmToken(
    token: string,
    platform: MemberFcmTokenPlatform,
  ): Promise<void>;

  deleteFcmToken(token: string): Promise<void>;
}

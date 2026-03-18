import type { MemberProfile } from '../../model/types';

export interface IMemberRepository {
  ensureMember(): Promise<MemberProfile>;

  getMyMemberProfile(): Promise<MemberProfile>;
}

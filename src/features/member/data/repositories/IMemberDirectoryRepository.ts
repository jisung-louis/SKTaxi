import type {MemberPublicProfile} from '../../model/types';

export type MemberDisplayNameMap = Record<string, string>;

export interface IMemberDirectoryRepository {
  getMemberPublicProfile(memberId: string): Promise<MemberPublicProfile | null>;
  getMemberDisplayNames(memberIds: string[]): Promise<MemberDisplayNameMap>;
}

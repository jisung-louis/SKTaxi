import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import {MemberApiClient, memberApiClient} from '../api/memberApiClient';
import {mapMemberPublicProfileDto} from '../mappers/memberMapper';
import type {IMemberDirectoryRepository} from './IMemberDirectoryRepository';

const UNKNOWN_DISPLAY_NAME = '알 수 없음';

export class SpringMemberDirectoryRepository
  implements IMemberDirectoryRepository
{
  constructor(private readonly apiClient: MemberApiClient = memberApiClient) {}

  async getMemberPublicProfile(memberId: string) {
    try {
      const response = await this.apiClient.getMemberPublicProfile(memberId);
      return mapMemberPublicProfileDto(response.data);
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async getMemberDisplayNames(memberIds: string[]) {
    const uniqueIds = Array.from(new Set(memberIds.filter(Boolean)));
    const entries = await Promise.all(
      uniqueIds.map(async memberId => {
        try {
          const profile = await this.getMemberPublicProfile(memberId);
          return [memberId, profile?.nickname?.trim() || UNKNOWN_DISPLAY_NAME];
        } catch (error) {
          console.warn('회원 공개 프로필 표시 이름 조회 실패:', error);
          return [memberId, UNKNOWN_DISPLAY_NAME];
        }
      }),
    );

    return Object.fromEntries(entries);
  }
}

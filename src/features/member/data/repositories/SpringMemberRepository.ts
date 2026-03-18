import { MemberApiClient, memberApiClient } from '../api/memberApiClient';
import { mapMemberResponseDto } from '../mappers/memberMapper';
import { IMemberRepository } from './IMemberRepository';

export class SpringMemberRepository implements IMemberRepository {
  constructor(
    private readonly apiClient: MemberApiClient = memberApiClient,
  ) {}

  async ensureMember() {
    const response = await this.apiClient.createMember();
    return mapMemberResponseDto(response.data);
  }

  async getMyMemberProfile() {
    const response = await this.apiClient.getMyMemberProfile();
    return mapMemberResponseDto(response.data);
  }
}

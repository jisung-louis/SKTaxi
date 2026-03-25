import {MemberApiClient, memberApiClient} from '../api/memberApiClient';
import {mapMemberResponseDto} from '../mappers/memberMapper';
import type {UpdateMemberProfileInput} from '../../model/types';
import {IMemberRepository} from './IMemberRepository';

export class SpringMemberRepository implements IMemberRepository {
  constructor(private readonly apiClient: MemberApiClient = memberApiClient) {}

  async ensureMember() {
    const response = await this.apiClient.createMember();
    return mapMemberResponseDto(response.data);
  }

  async getMyMemberProfile() {
    const response = await this.apiClient.getMyMemberProfile();
    return mapMemberResponseDto(response.data);
  }

  async updateMyProfile(profile: UpdateMemberProfileInput) {
    const response = await this.apiClient.updateMyProfile(profile);
    return mapMemberResponseDto(response.data);
  }

  async registerFcmToken(token: string, platform: 'ios' | 'android') {
    await this.apiClient.registerFcmToken({
      token,
      platform,
    });
  }

  async deleteFcmToken(token: string) {
    await this.apiClient.deleteFcmToken({
      token,
    });
  }
}

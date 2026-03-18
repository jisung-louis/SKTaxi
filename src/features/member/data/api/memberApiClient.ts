import { httpClient, type ApiSuccessResponse } from '@/shared/api';

import type { MemberResponseDto } from '../dto/memberDto';

export class MemberApiClient {
  createMember() {
    return httpClient.post<ApiSuccessResponse<MemberResponseDto>>(
      '/v1/members',
    );
  }

  getMyMemberProfile() {
    return httpClient.get<ApiSuccessResponse<MemberResponseDto>>(
      '/v1/members/me',
    );
  }
}

export const memberApiClient = new MemberApiClient();

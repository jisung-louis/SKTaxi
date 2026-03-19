import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  JoinRequestListItemResponseDto,
  JoinRequestResponseDto,
  MyPartyResponseDto,
  PartyDetailResponseDto,
  PartyPageResponseDto,
  JoinRequestStatusDto,
} from '../dto/taxiHomeDto';

export class TaxiHomeApiClient {
  cancelJoinRequest(requestId: string) {
    return httpClient.patch<ApiSuccessResponse<JoinRequestResponseDto>>(
      `/v1/join-requests/${requestId}/cancel`,
    );
  }

  createJoinRequest(partyId: string) {
    return httpClient.post<ApiSuccessResponse<JoinRequestResponseDto>>(
      `/v1/parties/${partyId}/join-requests`,
    );
  }

  getMyJoinRequests(params?: {status?: JoinRequestStatusDto}) {
    return httpClient.get<ApiSuccessResponse<JoinRequestListItemResponseDto[]>>(
      '/v1/members/me/join-requests',
      {
        params,
      },
    );
  }

  getMyParties() {
    return httpClient.get<ApiSuccessResponse<MyPartyResponseDto[]>>(
      '/v1/members/me/parties',
    );
  }

  getOpenParties() {
    return httpClient.get<ApiSuccessResponse<PartyPageResponseDto>>(
      '/v1/parties',
      {
        params: {
          size: 50,
          sort: 'createdAt,desc',
          status: 'OPEN',
        },
      },
    );
  }

  getParty(partyId: string) {
    return httpClient.get<ApiSuccessResponse<PartyDetailResponseDto>>(
      `/v1/parties/${partyId}`,
    );
  }
}

export const taxiHomeApiClient = new TaxiHomeApiClient();

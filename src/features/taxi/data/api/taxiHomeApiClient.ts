import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  ArrivePartyRequestDto,
  CreatePartyRequestDto,
  JoinRequestAcceptResponseDto,
  JoinRequestListItemResponseDto,
  JoinRequestResponseDto,
  PartyCreateResponseDto,
  PartyStatusResponseDto,
  MyPartyResponseDto,
  PartyDetailResponseDto,
  PartyPageResponseDto,
  JoinRequestStatusDto,
  PartyStatusDto,
  SettlementConfirmResponseDto,
  UpdatePartyRequestDto,
} from '../dto/taxiHomeDto';

export class TaxiHomeApiClient {
  cancelJoinRequest(requestId: string) {
    return httpClient.patch<ApiSuccessResponse<JoinRequestResponseDto>>(
      `/v1/join-requests/${requestId}/cancel`,
    );
  }

  cancelParty(partyId: string) {
    return httpClient.post<ApiSuccessResponse<PartyStatusResponseDto>>(
      `/v1/parties/${partyId}/cancel`,
    );
  }

  createJoinRequest(partyId: string) {
    return httpClient.post<ApiSuccessResponse<JoinRequestResponseDto>>(
      `/v1/parties/${partyId}/join-requests`,
    );
  }

  createParty(payload: CreatePartyRequestDto) {
    return httpClient.post<ApiSuccessResponse<PartyCreateResponseDto>>(
      '/v1/parties',
      payload,
    );
  }

  declineJoinRequest(requestId: string) {
    return httpClient.patch<ApiSuccessResponse<JoinRequestResponseDto>>(
      `/v1/join-requests/${requestId}/decline`,
    );
  }

  acceptJoinRequest(requestId: string) {
    return httpClient.patch<ApiSuccessResponse<JoinRequestAcceptResponseDto>>(
      `/v1/join-requests/${requestId}/accept`,
    );
  }

  arriveParty(partyId: string, payload: ArrivePartyRequestDto) {
    return httpClient.patch<ApiSuccessResponse<PartyDetailResponseDto>>(
      `/v1/parties/${partyId}/arrive`,
      payload,
    );
  }

  closeParty(partyId: string) {
    return httpClient.patch<ApiSuccessResponse<PartyStatusResponseDto>>(
      `/v1/parties/${partyId}/close`,
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

  getPartiesByStatus(status: PartyStatusDto) {
    return httpClient.get<ApiSuccessResponse<PartyPageResponseDto>>(
      '/v1/parties',
      {
        params: {
          size: 50,
          sort: 'createdAt,desc',
          status,
        },
      },
    );
  }

  getOpenParties() {
    return this.getPartiesByStatus('OPEN');
  }

  getClosedParties() {
    return this.getPartiesByStatus('CLOSED');
  }

  getArrivedParties() {
    return this.getPartiesByStatus('ARRIVED');
  }

  getParty(partyId: string) {
    return httpClient.get<ApiSuccessResponse<PartyDetailResponseDto>>(
      `/v1/parties/${partyId}`,
    );
  }

  getPartyJoinRequests(partyId: string) {
    return httpClient.get<ApiSuccessResponse<JoinRequestListItemResponseDto[]>>(
      `/v1/parties/${partyId}/join-requests`,
    );
  }

  kickMember(partyId: string, memberId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(
      `/v1/parties/${partyId}/members/${memberId}`,
    );
  }

  leaveParty(partyId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(
      `/v1/parties/${partyId}/members/me`,
    );
  }

  endParty(partyId: string) {
    return httpClient.patch<ApiSuccessResponse<PartyStatusResponseDto>>(
      `/v1/parties/${partyId}/end`,
    );
  }

  confirmSettlement(partyId: string, memberId: string) {
    return httpClient.patch<ApiSuccessResponse<SettlementConfirmResponseDto>>(
      `/v1/parties/${partyId}/settlement/members/${memberId}/confirm`,
    );
  }

  reopenParty(partyId: string) {
    return httpClient.patch<ApiSuccessResponse<PartyStatusResponseDto>>(
      `/v1/parties/${partyId}/reopen`,
    );
  }

  updateParty(partyId: string, payload: UpdatePartyRequestDto) {
    return httpClient.patch<ApiSuccessResponse<PartyDetailResponseDto>>(
      `/v1/parties/${partyId}`,
      payload,
    );
  }
}

export const taxiHomeApiClient = new TaxiHomeApiClient();

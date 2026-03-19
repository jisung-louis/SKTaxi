import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  MyPartyResponseDto,
  PartyPageResponseDto,
} from '../dto/taxiHomeDto';

export class TaxiHomeApiClient {
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
}

export const taxiHomeApiClient = new TaxiHomeApiClient();

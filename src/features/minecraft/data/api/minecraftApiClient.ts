import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  CreateMinecraftAccountRequestDto,
  MinecraftAccountResponseDto,
  MinecraftOverviewResponseDto,
  MinecraftPlayerResponseDto,
} from '../dto/minecraftDto';

export class MinecraftApiClient {
  getOverview() {
    return httpClient.get<ApiSuccessResponse<MinecraftOverviewResponseDto>>(
      '/v1/minecraft/overview',
    );
  }

  getPlayers() {
    return httpClient.get<ApiSuccessResponse<MinecraftPlayerResponseDto[]>>(
      '/v1/minecraft/players',
    );
  }

  getMyAccounts() {
    return httpClient.get<ApiSuccessResponse<MinecraftAccountResponseDto[]>>(
      '/v1/members/me/minecraft-accounts',
    );
  }

  createMyAccount(data: CreateMinecraftAccountRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<MinecraftAccountResponseDto>,
      CreateMinecraftAccountRequestDto
    >('/v1/members/me/minecraft-accounts', data);
  }

  deleteMyAccount(accountId: string) {
    return httpClient.delete<ApiSuccessResponse<MinecraftAccountResponseDto>>(
      `/v1/members/me/minecraft-accounts/${accountId}`,
    );
  }
}

export const minecraftApiClient = new MinecraftApiClient();

import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {AppVersionResponseDto} from '../dto/appVersionDto';

export class AppVersionApiClient {
  getAppVersion(platform: 'ios' | 'android') {
    return httpClient.get<ApiSuccessResponse<AppVersionResponseDto>>(
      `/v1/app-versions/${platform}`,
      {
        requiresAuth: false,
      },
    );
  }
}

export const appVersionApiClient = new AppVersionApiClient();

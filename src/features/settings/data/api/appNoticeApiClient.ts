import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {AppNoticeResponseDto} from '../dto/appNoticeDto';

export class AppNoticeApiClient {
  getAppNotice(noticeId: string) {
    return httpClient.get<ApiSuccessResponse<AppNoticeResponseDto>>(
      `/v1/app-notices/${noticeId}`,
      {
        requiresAuth: false,
      },
    );
  }

  getAppNotices() {
    return httpClient.get<ApiSuccessResponse<AppNoticeResponseDto[]>>(
      '/v1/app-notices',
      {
        requiresAuth: false,
      },
    );
  }
}

export const appNoticeApiClient = new AppNoticeApiClient();

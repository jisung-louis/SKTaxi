import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  AppNoticeReadResponseDto,
  AppNoticeResponseDto,
  AppNoticeUnreadCountResponseDto,
} from '../dto/appNoticeDto';

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

  getUnreadCount() {
    return httpClient.get<ApiSuccessResponse<AppNoticeUnreadCountResponseDto>>(
      '/v1/members/me/app-notices/unread-count',
    );
  }

  markAsRead(noticeId: string) {
    return httpClient.post<ApiSuccessResponse<AppNoticeReadResponseDto>>(
      `/v1/members/me/app-notices/${noticeId}/read`,
    );
  }
}

export const appNoticeApiClient = new AppNoticeApiClient();

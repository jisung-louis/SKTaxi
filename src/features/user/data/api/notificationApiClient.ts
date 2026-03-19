import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  NotificationListResponseDto,
  NotificationResponseDto,
} from '../dto/notificationDto';

interface NotificationListParams {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}

interface NotificationReadAllResponseDto {
  unreadCount: number;
  updatedCount: number;
}

export class NotificationApiClient {
  deleteNotification(notificationId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(
      `/v1/notifications/${notificationId}`,
    );
  }

  getNotifications(params?: NotificationListParams) {
    return httpClient.get<ApiSuccessResponse<NotificationListResponseDto>>(
      '/v1/notifications',
      {
        params,
      },
    );
  }

  markAllAsRead() {
    return httpClient.post<ApiSuccessResponse<NotificationReadAllResponseDto>>(
      '/v1/notifications/read-all',
    );
  }

  markAsRead(notificationId: string) {
    return httpClient.post<ApiSuccessResponse<NotificationResponseDto>>(
      `/v1/notifications/${notificationId}/read`,
    );
  }
}

export const notificationApiClient = new NotificationApiClient();

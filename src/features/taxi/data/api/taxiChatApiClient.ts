import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  ChatMessagePageResponseDto,
  ChatReadUpdateResponseDto,
  ChatRoomDetailResponseDto,
  ChatRoomSettingsResponseDto,
} from '../dto/taxiChatDto';

export class TaxiChatApiClient {
  getChatRoom(chatRoomId: string) {
    return httpClient.get<ApiSuccessResponse<ChatRoomDetailResponseDto>>(
      `/v1/chat-rooms/${chatRoomId}`,
    );
  }

  getMessages(
    chatRoomId: string,
    params?: {
      cursorCreatedAt?: string;
      cursorId?: string;
      size?: number;
    },
  ) {
    return httpClient.get<ApiSuccessResponse<ChatMessagePageResponseDto>>(
      `/v1/chat-rooms/${chatRoomId}/messages`,
      {
        params,
      },
    );
  }

  markAsRead(chatRoomId: string, lastReadAt: string) {
    return httpClient.patch<ApiSuccessResponse<ChatReadUpdateResponseDto>>(
      `/v1/chat-rooms/${chatRoomId}/read`,
      {
        lastReadAt,
      },
    );
  }

  updateSettings(chatRoomId: string, muted: boolean) {
    return httpClient.patch<ApiSuccessResponse<ChatRoomSettingsResponseDto>>(
      `/v1/chat-rooms/${chatRoomId}/settings`,
      {
        muted,
      },
    );
  }
}

export const taxiChatApiClient = new TaxiChatApiClient();

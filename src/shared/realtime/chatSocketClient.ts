import {
  buildWebSocketUrl,
  getApiRuntimeConfig,
  getAuthorizationHeaderValue,
} from '@/shared/api';

export interface ChatSocketConnectionRequest {
  endpointPath?: string;
  connectHeaders?: Record<string, string>;
  requiresAuth?: boolean;
  forceRefreshToken?: boolean;
  reconnectDelayMs?: number;
  heartbeatIncomingMs?: number;
  heartbeatOutgoingMs?: number;
}

export interface PreparedChatSocketConnection {
  url: string;
  connectHeaders: Record<string, string>;
  reconnectDelayMs: number;
  heartbeatIncomingMs: number;
  heartbeatOutgoingMs: number;
}

export class ChatSocketClient {
  async buildConnectionOptions(
    request: ChatSocketConnectionRequest = {},
  ): Promise<PreparedChatSocketConnection> {
    const runtimeConfig = getApiRuntimeConfig();
    const connectHeaders = {
      ...request.connectHeaders,
    };

    if (request.requiresAuth !== false) {
      const authorization = await getAuthorizationHeaderValue({
        forceRefresh: request.forceRefreshToken,
      });

      if (authorization) {
        connectHeaders.Authorization = authorization;
      }
    }

    return {
      url: buildWebSocketUrl(request.endpointPath ?? runtimeConfig.wsEndpointPath),
      connectHeaders,
      reconnectDelayMs:
        request.reconnectDelayMs ?? runtimeConfig.stompReconnectDelayMs,
      heartbeatIncomingMs:
        request.heartbeatIncomingMs ?? runtimeConfig.stompHeartbeatIncomingMs,
      heartbeatOutgoingMs:
        request.heartbeatOutgoingMs ?? runtimeConfig.stompHeartbeatOutgoingMs,
    };
  }
}

export const chatSocketClient = new ChatSocketClient();


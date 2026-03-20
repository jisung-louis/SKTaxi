import {
  buildWebSocketUrl,
  createRealtimeLogContext,
  getApiRuntimeConfig,
  getAuthorizationHeaderValue,
  logRealtimePrepared,
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

    const options = {
      url: buildWebSocketUrl(request.endpointPath ?? runtimeConfig.wsEndpointPath),
      connectHeaders,
      reconnectDelayMs:
        request.reconnectDelayMs ?? runtimeConfig.stompReconnectDelayMs,
      heartbeatIncomingMs:
        request.heartbeatIncomingMs ?? runtimeConfig.stompHeartbeatIncomingMs,
      heartbeatOutgoingMs:
        request.heartbeatOutgoingMs ?? runtimeConfig.stompHeartbeatOutgoingMs,
    };

    const logContext = createRealtimeLogContext({
      transport: 'stomp',
      url: options.url,
      headers: options.connectHeaders,
      extra: {
        reconnectDelayMs: options.reconnectDelayMs,
        heartbeatIncomingMs: options.heartbeatIncomingMs,
        heartbeatOutgoingMs: options.heartbeatOutgoingMs,
      },
    });

    logRealtimePrepared(logContext, {
      preparedOnly: true,
    });

    return options;
  }
}

export const chatSocketClient = new ChatSocketClient();

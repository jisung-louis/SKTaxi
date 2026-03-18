import {
  ApiQueryParams,
  buildApiUrl,
  getApiRuntimeConfig,
  getAuthorizationHeaderValue,
} from '@/shared/api';

export interface SseConnectionRequest {
  path: string;
  query?: ApiQueryParams;
  headers?: Record<string, string>;
  lastEventId?: string;
  requiresAuth?: boolean;
  forceRefreshToken?: boolean;
}

export interface PreparedSseConnection {
  url: string;
  headers: Record<string, string>;
  reconnectDelayMs: number;
}

export interface SseConnectionFactory<TConnection> {
  connect(options: PreparedSseConnection): TConnection;
}

export class SseClient {
  async buildConnectionOptions(
    request: SseConnectionRequest,
  ): Promise<PreparedSseConnection> {
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...request.headers,
    };

    if (request.lastEventId) {
      headers['Last-Event-ID'] = request.lastEventId;
    }

    if (request.requiresAuth !== false) {
      const authorization = await getAuthorizationHeaderValue({
        forceRefresh: request.forceRefreshToken,
      });

      if (authorization) {
        headers.Authorization = authorization;
      }
    }

    return {
      url: buildApiUrl(request.path, request.query),
      headers,
      reconnectDelayMs: getApiRuntimeConfig().sseReconnectDelayMs,
    };
  }

  async connect<TConnection>(
    request: SseConnectionRequest,
    factory: SseConnectionFactory<TConnection>,
  ): Promise<TConnection> {
    const options = await this.buildConnectionOptions(request);
    return factory.connect(options);
  }
}

export const sseClient = new SseClient();


import type {RepositoryError} from '@/shared/lib/errors';

import {buildApiUrl, type ApiQueryParams, type ApiQueryValue} from './apiConfig';
import {sanitizeHeadersForLog, sanitizeLogValue} from './apiLogSanitizer';

type HttpRequestLogContext = {
  requestId: string;
  startedAt: number;
  method: string;
  url: string;
};

type RealtimeLogContext = {
  requestId: string;
  startedAt: number;
  transport: 'sse' | 'stomp';
  url: string;
};

let requestSequence = 0;

const isApiQueryValue = (value: unknown): value is ApiQueryValue =>
  value === null ||
  value === undefined ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

const toLogUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return value;
  }
};

const toApiQueryParams = (value: unknown): ApiQueryParams | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value);
  if (entries.some(([, entryValue]) => !isApiQueryValue(entryValue))) {
    return undefined;
  }

  return Object.fromEntries(entries) as ApiQueryParams;
};

const isApiLogEnabled = () => __DEV__;

const nextRequestId = (prefix: 'http' | 'sse' | 'stomp') => {
  requestSequence += 1;
  return `${prefix}-${requestSequence}`;
};

const getDurationMs = (startedAt: number) => Date.now() - startedAt;

const debugLog = (label: string, payload: Record<string, unknown>) => {
  if (!isApiLogEnabled()) {
    return;
  }

  console.log(label, payload);
};

const buildHttpLabel = (
  phase: 'request' | 'response' | 'error',
  context: HttpRequestLogContext,
  statusCode?: number,
) => {
  if (phase === 'response' && statusCode) {
    return `[api][response][${statusCode}][${context.method} ${context.url}]`;
  }

  return `[api][${phase}][${context.method} ${context.url}]`;
};

const buildRealtimeLabel = (
  transport: 'sse' | 'stomp',
  phase: 'connect' | 'prepared' | 'connected' | 'error',
  path: string,
) => `[api][${transport}][${phase}][${path}]`;

export const createHttpRequestLogContext = (input: {
  method: string;
  path: string;
  params?: unknown;
  headers?: Record<string, unknown>;
  body?: unknown;
}): HttpRequestLogContext => {
  const context: HttpRequestLogContext = {
    requestId: nextRequestId('http'),
    startedAt: Date.now(),
    method: input.method.toUpperCase(),
    url: toLogUrl(buildApiUrl(input.path, toApiQueryParams(input.params))),
  };

  debugLog(buildHttpLabel('request', context), {
    requestId: context.requestId,
    method: context.method,
    path: context.url,
    params: sanitizeLogValue(input.params),
    headers: sanitizeHeadersForLog(input.headers),
    body: sanitizeLogValue(input.body),
  });

  return context;
};

export const logHttpResponse = (
  context: HttpRequestLogContext,
  input: {
    statusCode?: number;
    data?: unknown;
  },
) => {
  debugLog(buildHttpLabel('response', context, input.statusCode), {
    requestId: context.requestId,
    method: context.method,
    path: context.url,
    statusCode: input.statusCode,
    durationMs: getDurationMs(context.startedAt),
    data: sanitizeLogValue(input.data),
  });
};

export const logHttpError = (
  context: HttpRequestLogContext,
  error: RepositoryError,
) => {
  debugLog(buildHttpLabel('error', context), {
    requestId: context.requestId,
    method: context.method,
    path: context.url,
    durationMs: getDurationMs(context.startedAt),
    errorName: error.name,
    repositoryErrorCode: error.code,
    message: error.message,
    context: sanitizeLogValue(error.context),
  });
};

export const createRealtimeLogContext = (input: {
  transport: 'sse' | 'stomp';
  url: string;
  headers?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}): RealtimeLogContext => {
  const context: RealtimeLogContext = {
    requestId: nextRequestId(input.transport),
    startedAt: Date.now(),
    transport: input.transport,
    url: toLogUrl(input.url),
  };

  debugLog(buildRealtimeLabel(input.transport, 'connect', context.url), {
    requestId: context.requestId,
    transport: input.transport,
    path: context.url,
    headers: sanitizeHeadersForLog(input.headers),
    extra: sanitizeLogValue(input.extra),
  });

  return context;
};

export const logRealtimePrepared = (
  context: RealtimeLogContext,
  extra?: Record<string, unknown>,
) => {
  debugLog(buildRealtimeLabel(context.transport, 'prepared', context.url), {
    requestId: context.requestId,
    transport: context.transport,
    path: context.url,
    durationMs: getDurationMs(context.startedAt),
    extra: sanitizeLogValue(extra),
  });
};

export const logRealtimeConnected = (
  context: RealtimeLogContext,
  extra?: Record<string, unknown>,
) => {
  debugLog(buildRealtimeLabel(context.transport, 'connected', context.url), {
    requestId: context.requestId,
    transport: context.transport,
    path: context.url,
    durationMs: getDurationMs(context.startedAt),
    extra: sanitizeLogValue(extra),
  });
};

export const logRealtimeError = (
  context: RealtimeLogContext,
  error: unknown,
) => {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
        }
      : sanitizeLogValue(error);

  debugLog(buildRealtimeLabel(context.transport, 'error', context.url), {
    requestId: context.requestId,
    transport: context.transport,
    path: context.url,
    durationMs: getDurationMs(context.startedAt),
    error: normalizedError,
  });
};

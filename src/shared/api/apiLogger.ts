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
    url: buildApiUrl(input.path, toApiQueryParams(input.params)),
  };

  debugLog('[api][request]', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
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
  debugLog('[api][response]', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    statusCode: input.statusCode,
    durationMs: getDurationMs(context.startedAt),
    data: sanitizeLogValue(input.data),
  });
};

export const logHttpError = (
  context: HttpRequestLogContext,
  error: RepositoryError,
) => {
  debugLog('[api][error]', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
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
    url: input.url,
  };

  debugLog(`[api][${input.transport}][connect]`, {
    requestId: context.requestId,
    transport: input.transport,
    url: context.url,
    headers: sanitizeHeadersForLog(input.headers),
    extra: sanitizeLogValue(input.extra),
  });

  return context;
};

export const logRealtimePrepared = (
  context: RealtimeLogContext,
  extra?: Record<string, unknown>,
) => {
  debugLog(`[api][${context.transport}][prepared]`, {
    requestId: context.requestId,
    transport: context.transport,
    url: context.url,
    durationMs: getDurationMs(context.startedAt),
    extra: sanitizeLogValue(extra),
  });
};

export const logRealtimeConnected = (
  context: RealtimeLogContext,
  extra?: Record<string, unknown>,
) => {
  debugLog(`[api][${context.transport}][connected]`, {
    requestId: context.requestId,
    transport: context.transport,
    url: context.url,
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

  debugLog(`[api][${context.transport}][error]`, {
    requestId: context.requestId,
    transport: context.transport,
    url: context.url,
    durationMs: getDurationMs(context.startedAt),
    error: normalizedError,
  });
};

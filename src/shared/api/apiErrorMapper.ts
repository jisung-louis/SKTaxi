import axios from 'axios';

import {
  NetworkError,
  RepositoryError,
  RepositoryErrorCode,
} from '@/shared/lib/errors';

type ApiErrorBody = {
  message?: unknown;
  errorCode?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

const TOKEN_EXPIRED_CODES = new Set([
  'TOKEN_EXPIRED',
  'FIREBASE_TOKEN_EXPIRED',
  'ID_TOKEN_EXPIRED',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractApiErrorBody = (value: unknown): ApiErrorBody | null => {
  if (!isRecord(value)) {
    return null;
  }

  return value as ApiErrorBody;
};

const extractApiErrorMessage = (
  data: unknown,
  fallback: string,
): string => {
  const body = extractApiErrorBody(data);
  if (!body) {
    return fallback;
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (
    isRecord(body.error) &&
    typeof body.error.message === 'string' &&
    body.error.message.trim()
  ) {
    return body.error.message;
  }

  return fallback;
};

const extractApiErrorCode = (data: unknown): string | null => {
  const body = extractApiErrorBody(data);
  if (!body) {
    return null;
  }

  if (typeof body.errorCode === 'string' && body.errorCode.trim()) {
    return body.errorCode;
  }

  if (isRecord(body.error) && typeof body.error.code === 'string' && body.error.code.trim()) {
    return body.error.code;
  }

  return null;
};

export const mapApiError = (
  error: unknown,
  context?: Record<string, unknown>,
): RepositoryError => {
  if (error instanceof RepositoryError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new NetworkError('요청 시간이 초과되었습니다.', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        originalError: error,
        context,
      });
    }

    const statusCode = error.response?.status;
    const apiErrorCode = extractApiErrorCode(error.response?.data);
    const message = extractApiErrorMessage(
      error.response?.data,
      error.message || 'API 요청에 실패했습니다.',
    );

    if (statusCode === 401 && apiErrorCode && TOKEN_EXPIRED_CODES.has(apiErrorCode)) {
      return new RepositoryError(
        RepositoryErrorCode.TOKEN_EXPIRED,
        message,
        {
          originalError: error,
          context: {
            ...context,
            statusCode,
            apiErrorCode,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
          },
        },
      );
    }

    return new NetworkError(message, {
      statusCode,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      originalError: error,
      context: {
        ...context,
        apiErrorCode,
      },
    });
  }

  if (error instanceof Error) {
    return new RepositoryError(
      RepositoryErrorCode.UNKNOWN,
      error.message,
      {
        originalError: error,
        context,
      },
    );
  }

  return new RepositoryError(
    RepositoryErrorCode.UNKNOWN,
    '알 수 없는 API 오류가 발생했습니다.',
    { context },
  );
};


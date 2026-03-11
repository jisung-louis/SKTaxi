import { RepositoryError, RepositoryErrorCode } from './RepositoryError';

export class NetworkError extends RepositoryError {
  public readonly statusCode?: number;
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      url?: string;
      method?: string;
      originalError?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(
      NetworkError.getErrorCode(options?.statusCode),
      message,
      {
        originalError: options?.originalError,
        context: {
          ...options?.context,
          statusCode: options?.statusCode,
          url: options?.url,
          method: options?.method,
        },
      },
    );
    this.name = 'NetworkError';
    this.statusCode = options?.statusCode;
    this.url = options?.url;
    this.method = options?.method;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  private static getErrorCode(statusCode?: number): RepositoryErrorCode {
    if (!statusCode) {
      return RepositoryErrorCode.NETWORK_ERROR;
    }
    if (statusCode === 401) {
      return RepositoryErrorCode.UNAUTHENTICATED;
    }
    if (statusCode === 403) {
      return RepositoryErrorCode.PERMISSION_DENIED;
    }
    if (statusCode === 404) {
      return RepositoryErrorCode.NOT_FOUND;
    }
    if (statusCode === 408) {
      return RepositoryErrorCode.TIMEOUT;
    }
    if (statusCode === 409) {
      return RepositoryErrorCode.ALREADY_EXISTS;
    }
    if (statusCode === 422) {
      return RepositoryErrorCode.VALIDATION_FAILED;
    }
    if (statusCode === 429) {
      return RepositoryErrorCode.RATE_LIMITED;
    }
    if (statusCode >= 500) {
      return RepositoryErrorCode.NETWORK_ERROR;
    }

    return RepositoryErrorCode.UNKNOWN;
  }

  static async fromResponse(
    response: Response,
    context?: Record<string, any>,
  ): Promise<NetworkError> {
    let message = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const body = await response.json();
      if (body.message) {
        message = body.message;
      }
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // ignore parse failure
    }

    return new NetworkError(message, {
      statusCode: response.status,
      url: response.url,
      context,
    });
  }

  static offline(url?: string): NetworkError {
    return new NetworkError('네트워크에 연결되어 있지 않습니다.', {
      url,
      context: { offline: true },
    });
  }

  static timeout(url?: string, timeoutMs?: number): NetworkError {
    return new NetworkError(`요청 시간이 초과되었습니다. (${timeoutMs}ms)`, {
      url,
      context: { timeout: timeoutMs },
    });
  }
}

export enum RepositoryErrorCode {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  DATA_CORRUPTED = 'DATA_CORRUPTED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMITED = 'RATE_LIMITED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
}

export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    code: RepositoryErrorCode,
    message: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
    },
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.originalError = options?.originalError;
    this.context = options?.context;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, RepositoryError.prototype);
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  static fromFirebaseError(error: any, context?: Record<string, any>): RepositoryError {
    const firebaseCode = error?.code || '';

    const codeMap: Record<string, RepositoryErrorCode> = {
      'permission-denied': RepositoryErrorCode.PERMISSION_DENIED,
      'not-found': RepositoryErrorCode.NOT_FOUND,
      'already-exists': RepositoryErrorCode.ALREADY_EXISTS,
      'invalid-argument': RepositoryErrorCode.INVALID_ARGUMENT,
      unauthenticated: RepositoryErrorCode.UNAUTHENTICATED,
      'resource-exhausted': RepositoryErrorCode.QUOTA_EXCEEDED,
      'deadline-exceeded': RepositoryErrorCode.TIMEOUT,
      unavailable: RepositoryErrorCode.NETWORK_ERROR,
      'data-loss': RepositoryErrorCode.DATA_CORRUPTED,
    };

    const code = codeMap[firebaseCode] || RepositoryErrorCode.UNKNOWN;
    const message = error?.message || 'Unknown error occurred';

    return new RepositoryError(code, message, {
      originalError: error,
      context: { ...context, firebaseCode },
    });
  }

  isRetryable(): boolean {
    const retryableCodes = [
      RepositoryErrorCode.NETWORK_ERROR,
      RepositoryErrorCode.TIMEOUT,
      RepositoryErrorCode.RATE_LIMITED,
    ];

    return retryableCodes.includes(this.code);
  }

  getUserMessage(): string {
    const messageMap: Record<RepositoryErrorCode, string> = {
      [RepositoryErrorCode.UNKNOWN]: '알 수 없는 오류가 발생했습니다.',
      [RepositoryErrorCode.NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
      [RepositoryErrorCode.ALREADY_EXISTS]: '이미 존재하는 데이터입니다.',
      [RepositoryErrorCode.PERMISSION_DENIED]: '접근 권한이 없습니다.',
      [RepositoryErrorCode.INVALID_ARGUMENT]: '잘못된 요청입니다.',
      [RepositoryErrorCode.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
      [RepositoryErrorCode.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      [RepositoryErrorCode.UNAUTHENTICATED]: '로그인이 필요합니다.',
      [RepositoryErrorCode.TOKEN_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요.',
      [RepositoryErrorCode.DATA_CORRUPTED]: '데이터가 손상되었습니다.',
      [RepositoryErrorCode.VALIDATION_FAILED]: '입력 데이터가 올바르지 않습니다.',
      [RepositoryErrorCode.QUOTA_EXCEEDED]: '사용량 한도를 초과했습니다.',
      [RepositoryErrorCode.RATE_LIMITED]: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      [RepositoryErrorCode.SUBSCRIPTION_FAILED]: '실시간 연결에 실패했습니다.',
    };

    return messageMap[this.code] || messageMap[RepositoryErrorCode.UNKNOWN];
  }
}

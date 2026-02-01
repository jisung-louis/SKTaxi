// SKTaxi: 유효성 검증 에러 타입 정의

import { RepositoryError, RepositoryErrorCode } from './RepositoryError';

/**
 * 필드 에러 정보
 */
export interface FieldError {
  field: string;
  message: string;
  value?: any;
}

/**
 * 유효성 검증 에러 클래스
 * 데이터 유효성 검증 실패 시 사용
 */
export class ValidationError extends RepositoryError {
  public readonly fieldErrors: FieldError[];

  constructor(
    message: string,
    fieldErrors: FieldError[] = [],
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(RepositoryErrorCode.VALIDATION_FAILED, message, {
      originalError: options?.originalError,
      context: {
        ...options?.context,
        fieldErrors,
      },
    });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * 단일 필드 에러 생성
   */
  static field(field: string, message: string, value?: any): ValidationError {
    return new ValidationError(`${field}: ${message}`, [{ field, message, value }]);
  }

  /**
   * 필수 필드 누락 에러 생성
   */
  static required(field: string): ValidationError {
    return ValidationError.field(field, '필수 항목입니다.');
  }

  /**
   * 잘못된 형식 에러 생성
   */
  static invalidFormat(field: string, expectedFormat: string, value?: any): ValidationError {
    return ValidationError.field(
      field,
      `올바른 형식이 아닙니다. (예상: ${expectedFormat})`,
      value
    );
  }

  /**
   * 범위 초과 에러 생성
   */
  static outOfRange(
    field: string,
    min?: number,
    max?: number,
    value?: any
  ): ValidationError {
    let message = '허용 범위를 벗어났습니다.';
    if (min !== undefined && max !== undefined) {
      message = `${min}에서 ${max} 사이의 값이어야 합니다.`;
    } else if (min !== undefined) {
      message = `${min} 이상이어야 합니다.`;
    } else if (max !== undefined) {
      message = `${max} 이하여야 합니다.`;
    }
    return ValidationError.field(field, message, value);
  }

  /**
   * 길이 초과 에러 생성
   */
  static tooLong(field: string, maxLength: number, actualLength?: number): ValidationError {
    return ValidationError.field(
      field,
      `최대 ${maxLength}자까지 입력할 수 있습니다.${actualLength ? ` (현재: ${actualLength}자)` : ''}`,
    );
  }

  /**
   * 길이 부족 에러 생성
   */
  static tooShort(field: string, minLength: number, actualLength?: number): ValidationError {
    return ValidationError.field(
      field,
      `최소 ${minLength}자 이상 입력해야 합니다.${actualLength ? ` (현재: ${actualLength}자)` : ''}`,
    );
  }

  /**
   * 여러 필드 에러 병합
   */
  static combine(errors: ValidationError[]): ValidationError {
    const allFieldErrors = errors.flatMap(e => e.fieldErrors);
    const messages = errors.map(e => e.message).join(', ');
    return new ValidationError(messages, allFieldErrors);
  }

  /**
   * 특정 필드의 에러 메시지 반환
   */
  getFieldError(field: string): string | undefined {
    return this.fieldErrors.find(e => e.field === field)?.message;
  }

  /**
   * 모든 필드 에러를 객체로 반환 (form 라이브러리 연동용)
   */
  toFieldErrors(): Record<string, string> {
    return this.fieldErrors.reduce((acc, { field, message }) => {
      acc[field] = message;
      return acc;
    }, {} as Record<string, string>);
  }
}

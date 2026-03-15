import { RepositoryError, RepositoryErrorCode } from './RepositoryError';

export interface FieldError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationError extends RepositoryError {
  public readonly fieldErrors: FieldError[];

  constructor(
    message: string,
    fieldErrors: FieldError[] = [],
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
    },
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

  static field(field: string, message: string, value?: any): ValidationError {
    return new ValidationError(`${field}: ${message}`, [{ field, message, value }]);
  }

  static required(field: string): ValidationError {
    return ValidationError.field(field, '필수 항목입니다.');
  }

  static invalidFormat(field: string, expectedFormat: string, value?: any): ValidationError {
    return ValidationError.field(
      field,
      `올바른 형식이 아닙니다. (예상: ${expectedFormat})`,
      value,
    );
  }

  static outOfRange(
    field: string,
    min?: number,
    max?: number,
    value?: any,
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

  static tooLong(field: string, maxLength: number, actualLength?: number): ValidationError {
    return ValidationError.field(
      field,
      `최대 ${maxLength}자까지 입력할 수 있습니다.${actualLength ? ` (현재: ${actualLength}자)` : ''}`,
    );
  }

  static tooShort(field: string, minLength: number, actualLength?: number): ValidationError {
    return ValidationError.field(
      field,
      `최소 ${minLength}자 이상 입력해야 합니다.${actualLength ? ` (현재: ${actualLength}자)` : ''}`,
    );
  }

  static combine(errors: ValidationError[]): ValidationError {
    const allFieldErrors = errors.flatMap(error => error.fieldErrors);
    const messages = errors.map(error => error.message).join(', ');
    return new ValidationError(messages, allFieldErrors);
  }

  getFieldError(field: string): string | undefined {
    return this.fieldErrors.find(error => error.field === field)?.message;
  }

  toFieldErrors(): Record<string, string> {
    return this.fieldErrors.reduce((acc, { field, message }) => {
      acc[field] = message;
      return acc;
    }, {} as Record<string, string>);
  }
}

type SanitizerOptions = {
  depth?: number;
  maxArrayItems?: number;
  maxObjectKeys?: number;
  maxStringLength?: number;
};

const DEFAULT_OPTIONS: Required<SanitizerOptions> = {
  depth: 2,
  maxArrayItems: 5,
  maxObjectKeys: 12,
  maxStringLength: 180,
};

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
]);

const SENSITIVE_VALUE_KEYS = new Set([
  'token',
  'idtoken',
  'refreshtoken',
  'fcmtoken',
  'password',
  'authcode',
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
]);

const mergeOptions = (
  options?: SanitizerOptions,
): Required<SanitizerOptions> => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

const isSensitiveKey = (key: string) =>
  SENSITIVE_VALUE_KEYS.has(key.replace(/[^a-zA-Z]/g, '').toLowerCase());

const truncateString = (value: string, maxLength: number) =>
  value.length > maxLength
    ? `${value.slice(0, maxLength)}... (+${value.length - maxLength} chars)`
    : value;

const sanitizePrimitive = (
  value: string | number | boolean | null | undefined,
  options: Required<SanitizerOptions>,
) => {
  if (typeof value === 'string') {
    return truncateString(value, options.maxStringLength);
  }

  return value;
};

const sanitizeFormData = () => ({
  _type: 'FormData',
  summary: '<multipart payload>',
});

const sanitizeFileLike = (value: Record<string, unknown>) => {
  const result: Record<string, unknown> = {};

  if (typeof value.name === 'string') {
    result.name = value.name;
  }

  if (typeof value.type === 'string') {
    result.type = value.type;
  }

  if (typeof value.uri === 'string') {
    result.uri = '<redacted-uri>';
  }

  return {
    _type: 'FileLike',
    ...result,
  };
};

const sanitizeInternal = (
  value: unknown,
  options: Required<SanitizerOptions>,
  depth: number,
): unknown => {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return sanitizePrimitive(value, options);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return sanitizeFormData();
  }

  if (Array.isArray(value)) {
    if (depth >= options.depth) {
      return `[Array(${value.length})]`;
    }

    const preview = value
      .slice(0, options.maxArrayItems)
      .map(item => sanitizeInternal(item, options, depth + 1));
    const remainingCount = value.length - preview.length;

    if (remainingCount > 0) {
      preview.push(`... (+${remainingCount} items)`);
    }

    return preview;
  }

  if (isPlainObject(value)) {
    if (
      ('uri' in value || 'name' in value || 'type' in value) &&
      Object.keys(value).length <= 6
    ) {
      return sanitizeFileLike(value);
    }

    if (depth >= options.depth) {
      return {
        _type: 'Object',
        keys: Object.keys(value).slice(0, options.maxObjectKeys),
      };
    }

    const result: Record<string, unknown> = {};
    const entries = Object.entries(value).slice(0, options.maxObjectKeys);

    entries.forEach(([key, entryValue]) => {
      if (isSensitiveKey(key)) {
        result[key] = '<redacted>';
        return;
      }

      result[key] = sanitizeInternal(entryValue, options, depth + 1);
    });

    const remainingCount = Object.keys(value).length - entries.length;
    if (remainingCount > 0) {
      result.__truncatedKeys = remainingCount;
    }

    return result;
  }

  return String(value);
};

export const sanitizeLogValue = (
  value: unknown,
  options?: SanitizerOptions,
): unknown => sanitizeInternal(value, mergeOptions(options), 0);

export const sanitizeHeadersForLog = (
  headers?: Record<string, unknown>,
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  return Object.entries(headers).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const normalizedKey = key.toLowerCase();

      if (value === undefined || value === null) {
        return result;
      }

      if (SENSITIVE_HEADER_KEYS.has(normalizedKey)) {
        result[key] =
          normalizedKey === 'authorization'
            ? 'Bearer <redacted>'
            : '<redacted>';
        return result;
      }

      result[key] = truncateString(String(value), DEFAULT_OPTIONS.maxStringLength);
      return result;
    },
    {},
  );
};

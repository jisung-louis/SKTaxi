// SKTaxi: ISO 문자열(yyyy-mm-ddThh:mm:ssZ...)을 "오전/오후 hh:mm" 포맷으로 변환
export function formatKoreanAmPmTime(isoString?: string | null): string {
  if (!isoString) {
    return '';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '';
  }

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const period = isPM ? '오후' : '오전';
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  const mm = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${period} ${hours}:${mm}`;
}

function toSafeDate(value?: unknown): Date | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date ? value : new Date(value as string | number | Date);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatKoreanRelativeTime(value?: unknown): string {
  const date = toSafeDate(value);

  if (!date) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();

  if (diffMs < 0) {
    return '곧';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}일 전`;
  }

  if (diffHours > 0) {
    return `${diffHours}시간 전`;
  }

  if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  }

  return '방금 전';
}

export function formatKoreanAbsoluteDate(value?: unknown): string {
  const date = toSafeDate(value);

  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatKoreanAbsoluteWithRelativeTime(value?: unknown): string {
  const absoluteDate = formatKoreanAbsoluteDate(value);
  const relativeDate = formatKoreanRelativeTime(value);

  if (absoluteDate && relativeDate) {
    return `${absoluteDate} · ${relativeDate}`;
  }

  return absoluteDate || relativeDate;
}

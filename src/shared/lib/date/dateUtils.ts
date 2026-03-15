/**
 * 날짜 정규화 유틸리티 함수들
 * 시간대 문제를 해결하기 위해 날짜만 비교하도록 시간을 0으로 설정
 */

/**
 * 문자열 날짜를 정규화된 Date 객체로 변환
 * @param dateString - "2025-10-22" 형태의 날짜 문자열
 * @returns 시간이 00:00:00으로 설정된 Date 객체
 */
export const normalizeDate = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Date 객체를 정규화된 Date 객체로 변환
 * @param date - Date 객체
 * @returns 시간이 00:00:00으로 설정된 Date 객체
 */
export const normalizeDateObject = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * 두 날짜가 같은 날인지 비교
 * @param date1 - 첫 번째 날짜 (문자열 또는 Date)
 * @param date2 - 두 번째 날짜 (문자열 또는 Date)
 * @returns 같은 날이면 true, 아니면 false
 */
export const isSameDate = (date1: string | Date, date2: string | Date): boolean => {
  const normalized1 = typeof date1 === 'string' ? normalizeDate(date1) : normalizeDateObject(date1);
  const normalized2 = typeof date2 === 'string' ? normalizeDate(date2) : normalizeDateObject(date2);
  return normalized1.getTime() === normalized2.getTime();
};

/**
 * 첫 번째 날짜가 두 번째 날짜보다 이전이거나 같은지 비교
 * @param date1 - 첫 번째 날짜 (문자열 또는 Date)
 * @param date2 - 두 번째 날짜 (문자열 또는 Date)
 * @returns date1 <= date2이면 true, 아니면 false
 */
export const isDateBeforeOrEqual = (date1: string | Date, date2: string | Date): boolean => {
  const normalized1 = typeof date1 === 'string' ? normalizeDate(date1) : normalizeDateObject(date1);
  const normalized2 = typeof date2 === 'string' ? normalizeDate(date2) : normalizeDateObject(date2);
  return normalized1 <= normalized2;
};

/**
 * 첫 번째 날짜가 두 번째 날짜보다 이후이거나 같은지 비교
 * @param date1 - 첫 번째 날짜 (문자열 또는 Date)
 * @param date2 - 두 번째 날짜 (문자열 또는 Date)
 * @returns date1 >= date2이면 true, 아니면 false
 */
export const isDateAfterOrEqual = (date1: string | Date, date2: string | Date): boolean => {
  const normalized1 = typeof date1 === 'string' ? normalizeDate(date1) : normalizeDateObject(date1);
  const normalized2 = typeof date2 === 'string' ? normalizeDate(date2) : normalizeDateObject(date2);
  return normalized1 >= normalized2;
};

/**
 * 두 날짜 범위가 겹치는지 확인
 * @param start1 - 첫 번째 범위의 시작 날짜
 * @param end1 - 첫 번째 범위의 종료 날짜
 * @param start2 - 두 번째 범위의 시작 날짜
 * @param end2 - 두 번째 범위의 종료 날짜
 * @returns 겹치면 true, 아니면 false
 */
export const isDateRangeOverlapping = (
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean => {
  const normalizedStart1 = typeof start1 === 'string' ? normalizeDate(start1) : normalizeDateObject(start1);
  const normalizedEnd1 = typeof end1 === 'string' ? normalizeDate(end1) : normalizeDateObject(end1);
  const normalizedStart2 = typeof start2 === 'string' ? normalizeDate(start2) : normalizeDateObject(start2);
  const normalizedEnd2 = typeof end2 === 'string' ? normalizeDate(end2) : normalizeDateObject(end2);
  
  return normalizedStart1 <= normalizedEnd2 && normalizedStart2 <= normalizedEnd1;
};

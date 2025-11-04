import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 게시글/댓글이 수정되었는지 확인
 * @param createdAt 생성 시간
 * @param updatedAt 수정 시간
 * @param minDifferenceMs 최소 차이 시간 (밀리초, 기본값: 10000ms = 10초)
 * @returns 수정 여부
 */
export const isPostEdited = (
  createdAt: Date,
  updatedAt: Date | null | undefined,
  minDifferenceMs: number = 10000
): boolean => {
  if (!updatedAt) return false;
  
  const timeDiff = updatedAt.getTime() - createdAt.getTime();
  return timeDiff >= minDifferenceMs;
};

/**
 * 수정 시간 포맷팅
 * @param updatedAt 수정 시간
 * @returns 포맷된 문자열
 */
export const formatUpdatedTime = (updatedAt: Date): string => {
  return format(updatedAt, 'yyyy.MM.dd HH:mm', { locale: ko });
};


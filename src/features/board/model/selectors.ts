import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function isBoardPostEdited(
  createdAt: Date,
  updatedAt: Date | null | undefined,
  minDifferenceMs: number = 10000,
): boolean {
  if (!updatedAt) {
    return false;
  }

  return updatedAt.getTime() - createdAt.getTime() >= minDifferenceMs;
}

export function formatBoardUpdatedTime(updatedAt: Date): string {
  return format(updatedAt, 'yyyy.MM.dd HH:mm', { locale: ko });
}

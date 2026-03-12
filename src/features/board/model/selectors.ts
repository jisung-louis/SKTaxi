import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { COLORS } from '@/shared/constants/colors';

import type { BoardPostCategoryId } from './types';

export function getBoardCategoryColor(category: BoardPostCategoryId | string): string {
  switch (category) {
    case 'general':
      return COLORS.accent.blue;
    case 'question':
      return COLORS.accent.green;
    case 'review':
      return COLORS.accent.orange;
    case 'announcement':
      return COLORS.accent.red;
    default:
      return COLORS.text.secondary;
  }
}

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

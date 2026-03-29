import {
  type ReportCategory,
} from '@/shared/lib/moderation';
import {reportApiClient} from '@/shared/api/reportApiClient';

export const BOARD_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

export function submitBoardPostReport(
  postId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: postId,
      targetType: 'POST',
    })
    .then(response => response.data.id);
}

export function submitBoardCommentReport(
  commentId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: commentId,
      targetType: 'COMMENT',
    })
    .then(response => response.data.id);
}

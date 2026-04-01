import type {
  IReportRepository,
  ReportCategory,
} from '@/features/report';

export const BOARD_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

export function submitBoardPostReport(
  reportRepository: IReportRepository,
  postId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportRepository
    .createReport({
      category,
      reason: reason.trim(),
      targetId: postId,
      targetType: 'POST',
    })
    .then(response => response.id);
}

export function submitBoardCommentReport(
  reportRepository: IReportRepository,
  commentId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportRepository
    .createReport({
      category,
      reason: reason.trim(),
      targetId: commentId,
      targetType: 'COMMENT',
    })
    .then(response => response.id);
}

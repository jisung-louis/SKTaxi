import type {
  IReportRepository,
  ReportCategory,
} from '@/features/report';

export const CHAT_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

export const submitChatMessageReport = (
  reportRepository: IReportRepository,
  messageId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportRepository
    .createReport({
      category,
      reason: reason.trim(),
      targetId: messageId,
      targetType: 'CHAT_MESSAGE',
    })
    .then(response => response.id);

export const submitChatRoomReport = (
  reportRepository: IReportRepository,
  chatRoomId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportRepository
    .createReport({
      category,
      reason: reason.trim(),
      targetId: chatRoomId,
      targetType: 'CHAT_ROOM',
    })
    .then(response => response.id);

export const submitTaxiPartyReport = (
  reportRepository: IReportRepository,
  partyId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportRepository
    .createReport({
      category,
      reason: reason.trim(),
      targetId: partyId,
      targetType: 'TAXI_PARTY',
    })
    .then(response => response.id);

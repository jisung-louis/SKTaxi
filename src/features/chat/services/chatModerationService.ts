import {reportApiClient} from '@/shared/api/reportApiClient';
import type {ReportCategory} from '@/shared/lib/moderation';

export const CHAT_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

export const submitChatMessageReport = (
  messageId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: messageId,
      targetType: 'CHAT_MESSAGE',
    })
    .then(response => response.data.id);

export const submitChatRoomReport = (
  chatRoomId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: chatRoomId,
      targetType: 'CHAT_ROOM',
    })
    .then(response => response.data.id);

export const submitTaxiPartyReport = (
  partyId: string,
  category: ReportCategory,
  reason: string,
) =>
  reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: partyId,
      targetType: 'TAXI_PARTY',
    })
    .then(response => response.data.id);

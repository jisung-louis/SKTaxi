import { authInstance } from '@/shared/lib/firebase';
import type { ReportCategory } from '@/shared/lib/moderation';

import type { ChatMessage } from '../model/types';
import { chatModerationRuntime } from '../data/composition/chatModerationRuntime';

export const CHAT_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

const getCurrentUserId = () => authInstance.currentUser?.uid;

export const submitChatMessageReport = (
  targetMessage: ChatMessage,
  category: ReportCategory,
) =>
  chatModerationRuntime.createReport(
    {
      targetType: 'chat_message',
      targetId: targetMessage.id || '',
      targetAuthorId: targetMessage.senderId,
      category,
    },
    getCurrentUserId(),
  );

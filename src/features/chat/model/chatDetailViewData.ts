import type {ChatThreadListViewData} from '@/shared/ui/chat';

export interface ChatDetailPreviewViewData {
  description: string;
  helperText: string;
  joinLabel: string;
  lastMessageText: string;
  memberCountLabel: string;
  statusLabel: string;
  timeLabel: string;
}

export interface ChatDetailViewData extends ChatThreadListViewData {
  composerPlaceholder: string
  mode: 'joined' | 'preview'
  preview?: ChatDetailPreviewViewData
}

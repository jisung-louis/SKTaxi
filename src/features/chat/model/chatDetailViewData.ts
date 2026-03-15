import type {ChatRoom} from './types';
import type {ChatAvatarViewData, ChatThreadListViewData} from '@/shared/ui/chat';

export const CHAT_DETAIL_CURRENT_USER_ID = 'current-user';
export const CHAT_DETAIL_CURRENT_USER_NAME = '나';

export interface ChatDetailSourceMessageItem {
  avatar?: ChatAvatarViewData
  createdAt: string
  id: string
  senderId: string
  senderName: string
  text: string
  type?: 'text' | 'system'
}

export interface ChatDetailSourceData {
  composerPlaceholder: string
  id: string
  memberCount: number
  notificationEnabled: boolean
  roomType: ChatRoom['type']
  title: string
  messages: ChatDetailSourceMessageItem[]
}

export interface ChatDetailViewData extends ChatThreadListViewData {
  composerPlaceholder: string
}

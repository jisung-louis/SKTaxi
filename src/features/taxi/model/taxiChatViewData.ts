import type {
  ChatAvatarViewData,
  ChatThreadListViewData,
} from '@/shared/ui/chat';

import type {TaxiRecruitDraft} from './taxiRecruitData';

export const TAXI_CHAT_CURRENT_USER_ID = 'current-user';
export const TAXI_CHAT_CURRENT_USER_NAME = '나';

export interface TaxiChatSummaryViewData {
  departureLabel: string
  departureTimeLabel: string
  destinationLabel: string
  memberSummaryLabel: string
  tagLabel: string
}

export interface TaxiChatSourceMessageItem {
  avatar?: ChatAvatarViewData
  createdAt: string
  id: string
  senderId: string
  senderName: string
  text: string
  type?: 'text' | 'system'
}

export interface TaxiChatSourceData {
  composerPlaceholder: string
  id: string
  maxMembers: number
  memberCount: number
  notificationEnabled: boolean
  summary: TaxiChatSummaryViewData
  title: string
  messages: TaxiChatSourceMessageItem[]
}

export interface TaxiChatViewData extends ChatThreadListViewData {
  composerPlaceholder: string
  summary: TaxiChatSummaryViewData
}

export interface CreateTaxiChatRoomParams {
  draft: TaxiRecruitDraft
}

export interface TaxiChatSessionSnapshot {
  currentPartyId: string | null
}

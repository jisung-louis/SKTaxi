import type {
  ChatAvatarViewData,
  ChatThreadListViewData,
} from '@/shared/ui/chat';

import type {TaxiRecruitDraft} from './taxiRecruitData';

export const TAXI_CHAT_CURRENT_USER_ID = 'current-user';
export const TAXI_CHAT_CURRENT_USER_NAME = '나';

export type TaxiChatPartyStatus = 'open' | 'closed' | 'arrived' | 'ended';
export type TaxiChatLeaderActionId = 'close' | 'reopen' | 'arrive' | 'end';
export type TaxiChatMemberActionId = 'kick' | 'confirmSettlement';

export interface TaxiChatSummaryActionViewData {
  id: TaxiChatLeaderActionId
  label: string
  tone: 'primary' | 'secondary' | 'danger'
}

export interface TaxiChatSummaryMemberActionViewData {
  actionId?: TaxiChatMemberActionId
  actionLabel?: string
  actionTone?: 'primary' | 'danger'
  id: string
  label: string
  metaLabel: string
}

export interface TaxiChatSummaryManagementViewData {
  canLeave: boolean
  isLeader: boolean
  memberActionSectionTitle?: string
  memberActions: TaxiChatSummaryMemberActionViewData[]
  noticeLabel?: string
  primaryActions: TaxiChatSummaryActionViewData[]
  settlementSummaryLabel?: string
  statusLabel: string
  statusTone: TaxiChatPartyStatus
}

export interface TaxiChatSummaryViewData {
  departureLabel: string
  departureTimeLabel: string
  destinationLabel: string
  management: TaxiChatSummaryManagementViewData
  memberSummaryLabel: string
  tagLabel: string
}

export interface TaxiChatSourceParticipant {
  id: string
  isLeader: boolean
  name: string
  settled: boolean
  settledAt?: string
}

export interface TaxiChatSourceSettlement {
  perPersonAmount: number
  status: 'pending' | 'completed'
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
  leaderId: string
  maxMembers: number
  memberCount: number
  notificationEnabled: boolean
  participants: TaxiChatSourceParticipant[]
  partyStatus: TaxiChatPartyStatus
  settlement?: TaxiChatSourceSettlement
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

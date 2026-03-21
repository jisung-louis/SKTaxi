import type {
  ChatAvatarViewData,
  ChatThreadHeaderViewData,
  ChatThreadMenuViewData,
} from '@/shared/ui/chat';

import type {TaxiRecruitDraft} from './taxiRecruitData';
import type {
  AccountMessageDraft,
  PartyLocation,
} from './types';

export const TAXI_CHAT_CURRENT_USER_ID = 'current-user';
export const TAXI_CHAT_CURRENT_USER_NAME = '나';

export type TaxiChatPartyStatus = 'open' | 'closed' | 'arrived' | 'ended';
export type TaxiChatActionTrayActionId =
  | 'callTaxi'
  | 'sendAccount'
  | 'close'
  | 'reopen'
  | 'arrive'
  | 'settlementStatus'
  | 'end';

export interface TaxiChatActionTrayActionViewData {
  id: TaxiChatActionTrayActionId;
  label: string;
  tone: 'brand' | 'info' | 'warning' | 'danger' | 'purple';
}

export interface TaxiChatSummaryManagementViewData {
  canCancelParty: boolean;
  canEditParty: boolean;
  canLeave: boolean;
  canManageSettlement: boolean;
  isLeader: boolean;
  noticeLabel?: string;
}

export interface TaxiChatSettlementMemberViewData {
  id: string;
  isCurrentUser: boolean;
  isLeader: boolean;
  label: string;
  settled: boolean;
}

export interface TaxiChatSettlementNoticeViewData {
  accountData?: TaxiChatSourceAccountData;
  accountLabel?: string;
  completedCount: number;
  description: string;
  members: TaxiChatSettlementMemberViewData[];
  perPersonAmount?: number;
  splitMemberCount?: number;
  statusLabel: string;
  summaryLabel: string;
  taxiFare?: number;
  totalCount: number;
}

export interface TaxiChatSummaryViewData {
  departureLabel: string;
  departureLocation: PartyLocation;
  departureTimeISO: string;
  departureTimeLabel: string;
  detail?: string;
  destinationLabel: string;
  destinationLocation: PartyLocation;
  management: TaxiChatSummaryManagementViewData;
  memberSummaryLabel: string;
  members: TaxiChatSettlementMemberViewData[];
  partyStatus: TaxiChatPartyStatus;
  settlementNotice?: TaxiChatSettlementNoticeViewData;
  tagLabel: string;
}

export interface TaxiChatSourceParticipant {
  id: string;
  isLeader: boolean;
  name: string;
  settled: boolean;
  settledAt?: string;
}

export interface TaxiChatSourceSettlement {
  accountData?: TaxiChatSourceAccountData;
  splitMemberCount?: number;
  settlementTargetMemberIds: string[];
  perPersonAmount: number;
  status: 'pending' | 'completed';
  taxiFare?: number;
}

export interface TaxiChatSourceAccountData {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  hideName: boolean;
}

export interface TaxiChatSourceArrivalData {
  accountData?: TaxiChatSourceAccountData;
  perPersonAmount?: number;
  settlementTargetMemberIds: string[];
  splitMemberCount?: number;
  taxiFare?: number;
}

export interface TaxiChatAccountMessageDraft extends AccountMessageDraft {}

export interface TaxiChatSourceMessageItem {
  accountData?: TaxiChatSourceAccountData;
  arrivalData?: TaxiChatSourceArrivalData;
  avatar?: ChatAvatarViewData;
  createdAt: string;
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'system' | 'account' | 'arrived' | 'end';
}

export interface TaxiChatSourceData {
  composerPlaceholder: string;
  departureLocation: PartyLocation;
  departureTimeISO: string;
  detail?: string;
  destinationLocation: PartyLocation;
  id: string;
  latestAccountData?: TaxiChatSourceAccountData;
  leaderId: string;
  maxMembers: number;
  memberCount: number;
  messages: TaxiChatSourceMessageItem[];
  notificationEnabled: boolean;
  participants: TaxiChatSourceParticipant[];
  partyStatus: TaxiChatPartyStatus;
  settlement?: TaxiChatSourceSettlement;
  tagLabel: string;
  title: string;
}

export interface TaxiChatDateDividerViewData {
  id: string;
  label: string;
  type: 'date-divider';
}

export interface TaxiChatTextMessageViewData {
  avatar?: ChatAvatarViewData;
  direction: 'incoming' | 'outgoing';
  id: string;
  minuteKey: string;
  senderId: string;
  senderName: string;
  text: string;
  timeLabel: string;
  type: 'text-message';
}

export interface TaxiChatSystemMessageViewData {
  id: string;
  text: string;
  type: 'system-message';
}

export interface TaxiChatAccountMessageViewData {
  accountData: TaxiChatSourceAccountData;
  id: string;
  senderName: string;
  text: string;
  timeLabel: string;
  type: 'account-message';
}

export interface TaxiChatArrivedMessageViewData {
  accountData?: TaxiChatSourceAccountData;
  accountLabel?: string;
  id: string;
  perPersonAmount?: number;
  settlementTargetMemberIds: string[];
  splitMemberCount?: number;
  taxiFare?: number;
  timeLabel: string;
  type: 'arrived-message';
}

export interface TaxiChatEndMessageViewData {
  id: string;
  text: string;
  type: 'end-message';
}

export type TaxiChatThreadItemViewData =
  | TaxiChatDateDividerViewData
  | TaxiChatTextMessageViewData
  | TaxiChatSystemMessageViewData
  | TaxiChatAccountMessageViewData
  | TaxiChatArrivedMessageViewData
  | TaxiChatEndMessageViewData;

export interface TaxiChatViewData {
  actionTrayActions: TaxiChatActionTrayActionViewData[];
  composerPlaceholder: string;
  currentUserId: string;
  header: ChatThreadHeaderViewData;
  items: TaxiChatThreadItemViewData[];
  menu: ChatThreadMenuViewData & {
    canCancelParty: boolean;
    canEditParty: boolean;
    isLeader: boolean;
  };
  roomId: string;
  summary: TaxiChatSummaryViewData;
}

export interface CreateTaxiChatRoomParams {
  draft: TaxiRecruitDraft;
}

export interface TaxiChatSessionSnapshot {
  currentPartyId: string | null;
}

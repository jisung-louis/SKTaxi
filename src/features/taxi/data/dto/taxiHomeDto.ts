export type PartyStatusDto = 'OPEN' | 'CLOSED' | 'ARRIVED' | 'ENDED';

export type JoinRequestStatusDto =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELED';

export interface PartyLocationDto {
  lat: number;
  lng: number;
  name: string;
}

export interface PartySummaryResponseDto {
  createdAt: string;
  currentMembers: number;
  departure: PartyLocationDto;
  departureTime: string;
  destination: PartyLocationDto;
  detail?: string | null;
  id: string;
  leaderId: string;
  leaderName?: string | null;
  leaderPhotoUrl?: string | null;
  maxMembers: number;
  status: PartyStatusDto;
  tags?: string[] | null;
}

export interface PartyPageResponseDto {
  content: PartySummaryResponseDto[];
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PartySettlementMemberResponseDto {
  memberId: string;
  memberName?: string | null;
  settled: boolean;
  settledAt?: string | null;
}

export interface SettlementSummaryResponseDto {
  memberSettlements?: PartySettlementMemberResponseDto[] | null;
  perPersonAmount?: number | null;
  status: string;
}

export interface MyPartyResponseDto {
  departure: PartyLocationDto;
  destination: PartyLocationDto;
  id: string;
  isLeader: boolean;
  settlement?: SettlementSummaryResponseDto | null;
  status: PartyStatusDto;
}

export interface PartyMemberResponseDto {
  id: string;
  isLeader: boolean;
  joinedAt?: string | null;
  nickname?: string | null;
  photoUrl?: string | null;
}

export interface PartyDetailResponseDto {
  createdAt: string;
  departure: PartyLocationDto;
  departureTime: string;
  destination: PartyLocationDto;
  detail?: string | null;
  id: string;
  leaderId: string;
  leaderName?: string | null;
  leaderPhotoUrl?: string | null;
  maxMembers: number;
  members: PartyMemberResponseDto[];
  settlement?: SettlementSummaryResponseDto | null;
  status: PartyStatusDto;
  tags?: string[] | null;
}

export interface JoinRequestResponseDto {
  id: string;
  status: JoinRequestStatusDto;
}

export interface JoinRequestListItemResponseDto {
  createdAt: string;
  id: string;
  partyId: string;
  requesterId: string;
  requesterName?: string | null;
  requesterPhotoUrl?: string | null;
  status: JoinRequestStatusDto;
}

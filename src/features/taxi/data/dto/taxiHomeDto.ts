export type PartyStatusDto = 'OPEN' | 'CLOSED' | 'ARRIVED' | 'ENDED';

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

export interface SettlementSummaryResponseDto {
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

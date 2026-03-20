export interface PartyLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface PartySettlementMember {
  settled: boolean;
  settledAt?: unknown;
}

export interface PartySettlement {
  status: 'pending' | 'completed';
  perPersonAmount: number;
  members: Record<string, PartySettlementMember>;
}

export interface Party {
  id?: string;
  leaderId: string;
  departure: PartyLocation;
  destination: PartyLocation;
  departureTime: string;
  maxMembers: number;
  members: string[];
  tags?: string[];
  detail?: string;
  status: 'open' | 'closed' | 'arrived' | 'ended';
  endReason?: 'arrived' | 'cancelled' | 'timeout' | 'withdrawed';
  endedAt?: unknown;
  settlement?: PartySettlement;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PartyMember {
  role: 'leader' | 'member';
  joinedAt?: unknown;
}

export interface PendingJoinRequest {
  requestId: string;
  partyId: string;
}

export interface JoinRequest {
  id: string;
  partyId: string;
  requesterId: string;
  leaderId: string;
  status: 'pending' | 'accepted' | 'declined' | 'canceled';
  createdAt: unknown;
}

export interface JoinRequestStatus {
  requestId: string;
  partyId: string;
  status: JoinRequest['status'];
}

export interface SettlementData {
  perPersonAmount: number;
  members: Record<string, PartySettlementMember>;
  taxiFare?: number;
}

export interface AccountMessageData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

export interface ArrivalMessageData {
  taxiFare: number;
  perPerson: number;
  memberCount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

export interface PartyMessage {
  id: string;
  partyId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'user' | 'system' | 'account' | 'arrived' | 'end';
  accountData?: AccountMessageData;
  arrivalData?: ArrivalMessageData;
  createdAt: unknown;
  updatedAt?: unknown;
}

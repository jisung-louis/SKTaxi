// SKTaxi: Firestore 컬렉션 타입 정의를 추가합니다 (파티, 요청, 멤버, 사용자 문서 스키마).
export type Party = {
  id?: string;
  leaderId: string;
  departure: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  departureTime: string; // ISO
  maxMembers: number;
  members: string[]; // uid list (leader 포함)
  tags?: string[];
  detail?: string;
  status: 'open' | 'closed' | 'onboard';
  createdAt?: any;
  updatedAt?: any;
};

export type JoinRequest = {
  id?: string;
  partyId: string;
  leaderId: string;
  requesterId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: any;
};

export type PartyMember = {
  role: 'leader' | 'member';
  joinedAt?: any;
};

export type UserDoc = {
  displayName?: string;
  photoUrl?: string;
  fcmTokens?: string[];
  createdAt?: any;
  lastActiveAt?: any;
};

export type Message = {
  id?: string;
  partyId: string;
  senderId: string;
  senderName: string;
  text: string;
  type?: 'user' | 'system'; // SKTaxi: 메시지 타입 추가 (기본값: 'user')
  createdAt?: any;
  updatedAt?: any;
};



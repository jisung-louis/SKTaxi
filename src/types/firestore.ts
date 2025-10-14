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
  status: 'open' | 'closed' | 'arrived';
  settlement?: { // SKTaxi: 정산 현황 필드 추가
    status: 'pending' | 'completed';
    perPersonAmount: number;
    members: {
      [memberId: string]: {
        settled: boolean;
        settledAt?: any;
      };
    };
  };
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
  type?: 'user' | 'system' | 'account' | 'arrived' | 'end'; // SKTaxi: 메시지 타입 추가 (기본값: 'user')
  accountData?: { // SKTaxi: 계좌 정보 메시지용 데이터
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    hideName: boolean;
  };
  arrivalData?: { // SKTaxi: 도착 메시지용 데이터
    taxiFare: number;
    perPerson: number;
    memberCount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    hideName: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
};



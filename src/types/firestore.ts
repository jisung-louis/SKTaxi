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
  // SKTaxi: 파티 상태
  // open: 모집 중, closed: 모집 마감, arrived: 도착 후 정산 진행 중, ended: 종료(소프트 삭제)
  status: 'open' | 'closed' | 'arrived' | 'ended';
  // SKTaxi: 종료 사유 (status === 'ended' 일 때 설정)
  // arrived: 도착 후 리더가 동승 종료, cancelled: 리더가 파티를 수동 삭제, timeout: 오래된 파티 자동 정리,
  // withdrawed: 리더 회원 탈퇴로 인한 종료
  endReason?: 'arrived' | 'cancelled' | 'timeout' | 'withdrawed';
  endedAt?: any;
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

export type ChatRoom = {
  id?: string;
  name: string;
  type: 'university' | 'department' | 'game' | 'custom';
  department?: string; // type이 'department'일 때만
  description?: string;
  createdBy: string; // userId
  members: string[]; // userId 배열
  maxMembers?: number;
  isPublic: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: any;
  };
  unreadCount?: { [userId: string]: number }; // 사용자별 읽지 않은 메시지 수
};

export type ChatMessage = {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  type?: 'text' | 'image' | 'system';
  createdAt?: any;
  readBy?: string[]; // userId 배열
  direction?: 'mc_to_app' | 'app_to_mc' | 'system';
  source?: 'minecraft' | 'app';
  minecraftUuid?: string | null;
  appUserDisplayName?: string | null;
};



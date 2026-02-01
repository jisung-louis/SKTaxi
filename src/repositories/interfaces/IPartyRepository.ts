// SKTaxi: Party Repository 인터페이스 - DIP 원칙 적용
// 비즈니스 로직과 데이터 접근 계층을 분리하여 테스트 용이성 확보

import { Party } from '../../types/party';

/**
 * 실시간 구독 해제 함수 타입
 */
export type Unsubscribe = () => void;

/**
 * 구독 콜백 함수 타입
 */
export interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError: (error: Error) => void;
}

/**
 * Party Repository 인터페이스
 * Firestore 구현체와 Mock 구현체가 이 인터페이스를 따름
 */
export interface IPartyRepository {
  /**
   * 모든 활성 파티 실시간 구독
   * status가 'ended'가 아닌 파티만 반환
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToParties(callbacks: SubscriptionCallbacks<Party[]>): Unsubscribe;

  /**
   * 특정 파티 실시간 구독
   * @param partyId - 파티 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToParty(partyId: string, callbacks: SubscriptionCallbacks<Party | null>): Unsubscribe;

  /**
   * 사용자의 현재 참여 중인 파티 조회
   * @param userId - 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToMyParty(userId: string, callbacks: SubscriptionCallbacks<Party | null>): Unsubscribe;

  /**
   * 파티 생성
   * @param party - 생성할 파티 데이터 (id 제외)
   * @returns 생성된 파티 ID
   */
  createParty(party: Omit<Party, 'id'>): Promise<string>;

  /**
   * 파티 정보 업데이트
   * @param partyId - 파티 ID
   * @param updates - 업데이트할 필드
   */
  updateParty(partyId: string, updates: Partial<Party>): Promise<void>;

  /**
   * 파티 삭제 (소프트 삭제 - status를 'ended'로 변경)
   * @param partyId - 파티 ID
   * @param reason - 종료 사유
   */
  deleteParty(partyId: string, reason: Party['endReason']): Promise<void>;

  /**
   * 파티에 멤버 추가
   * @param partyId - 파티 ID
   * @param userId - 추가할 사용자 ID
   */
  addMember(partyId: string, userId: string): Promise<void>;

  /**
   * 파티에서 멤버 제거
   * @param partyId - 파티 ID
   * @param userId - 제거할 사용자 ID
   */
  removeMember(partyId: string, userId: string): Promise<void>;

  /**
   * 특정 파티 단일 조회 (구독 없이)
   * @param partyId - 파티 ID
   * @returns 파티 데이터 또는 null
   */
  getParty(partyId: string): Promise<Party | null>;

  /**
   * 리더의 pending 동승 요청 개수 실시간 구독
   * @param leaderId - 리더(방장) 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToJoinRequestCount(
    leaderId: string,
    callbacks: SubscriptionCallbacks<number>
  ): Unsubscribe;

  /**
   * 사용자의 pending 동승 요청 실시간 구독
   * @param requesterId - 요청자 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToMyPendingJoinRequest(
    requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>
  ): Unsubscribe;

  /**
   * 특정 동승 요청 실시간 구독 (상태 변경 감지)
   * @param requestId - 요청 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToJoinRequest(
    requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>
  ): Unsubscribe;

  /**
   * 동승 요청 취소
   * @param requestId - 요청 ID
   */
  cancelJoinRequest(requestId: string): Promise<void>;

  /**
   * 동승 요청 생성
   * @param partyId - 파티 ID
   * @param leaderId - 파티 리더 ID
   * @param requesterId - 요청자 ID
   * @returns 생성된 요청 ID
   */
  createJoinRequest(partyId: string, leaderId: string, requesterId: string): Promise<string>;

  // === 파티 채팅 메시지 관련 ===

  /**
   * 파티 채팅 메시지 실시간 구독
   * @param partyId - 파티 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToPartyMessages(partyId: string, callbacks: SubscriptionCallbacks<PartyMessage[]>): Unsubscribe;

  /**
   * 파티 채팅 일반 메시지 전송
   * @param partyId - 파티 ID
   * @param senderId - 발신자 ID
   * @param text - 메시지 텍스트
   */
  sendPartyMessage(partyId: string, senderId: string, text: string): Promise<void>;

  /**
   * 파티 채팅 시스템 메시지 전송
   * @param partyId - 파티 ID
   * @param text - 메시지 텍스트
   */
  sendSystemMessage(partyId: string, text: string): Promise<void>;

  /**
   * 파티 채팅 계좌 정보 메시지 전송
   * @param partyId - 파티 ID
   * @param senderId - 발신자 ID
   * @param accountData - 계좌 정보
   */
  sendAccountMessage(partyId: string, senderId: string, accountData: AccountMessageData): Promise<void>;

  /**
   * 파티 채팅 도착 메시지 전송
   * @param partyId - 파티 ID
   * @param senderId - 발신자 ID
   * @param arrivalData - 도착/정산 정보
   */
  sendArrivedMessage(partyId: string, senderId: string, arrivalData: ArrivalMessageData): Promise<void>;

  /**
   * 파티 채팅 종료 메시지 전송
   * @param partyId - 파티 ID
   * @param senderId - 발신자 ID
   * @param partyArrived - 도착 여부
   */
  sendEndMessage(partyId: string, senderId: string, partyArrived: boolean): Promise<void>;

  // === 동승 요청 관리 (확장) ===

  /**
   * 파티의 pending 동승 요청 목록 실시간 구독 (리더용)
   * @param partyId - 파티 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToJoinRequests(partyId: string, callbacks: SubscriptionCallbacks<JoinRequest[]>): Unsubscribe;

  /**
   * 동승 요청 승인
   * @param requestId - 요청 ID
   * @param partyId - 파티 ID
   * @param requesterId - 요청자 ID
   */
  acceptJoinRequest(requestId: string, partyId: string, requesterId: string): Promise<void>;

  /**
   * 동승 요청 거절
   * @param requestId - 요청 ID
   */
  declineJoinRequest(requestId: string): Promise<void>;

  // === 파티 채팅 알림 설정 ===

  /**
   * 파티 채팅 알림 음소거 상태 조회
   * @param partyId - 파티 ID
   * @param userId - 사용자 ID
   * @returns 음소거 여부
   */
  getPartyChatMuted(partyId: string, userId: string): Promise<boolean>;

  /**
   * 파티 채팅 알림 음소거 설정 업데이트
   * @param partyId - 파티 ID
   * @param userId - 사용자 ID
   * @param muted - 음소거 여부
   */
  setPartyChatMuted(partyId: string, userId: string, muted: boolean): Promise<void>;

  // === 정산 관리 ===

  /**
   * 파티 정산 시작 (도착 확정)
   * @param partyId - 파티 ID
   * @param settlementData - 정산 데이터
   */
  startSettlement(partyId: string, settlementData: SettlementData): Promise<void>;

  /**
   * 멤버 정산 완료 처리
   * @param partyId - 파티 ID
   * @param memberId - 멤버 ID
   */
  markMemberSettled(partyId: string, memberId: string): Promise<void>;

  /**
   * 정산 완료 및 파티 종료
   * @param partyId - 파티 ID
   */
  completeSettlement(partyId: string): Promise<void>;
}

/**
 * Pending 동승 요청 정보
 */
export interface PendingJoinRequest {
  requestId: string;
  partyId: string;
}

/**
 * 동승 요청 상세 정보 (리더가 조회)
 */
export interface JoinRequest {
  id: string;
  partyId: string;
  requesterId: string;
  leaderId: string;
  status: 'pending' | 'accepted' | 'declined' | 'canceled';
  createdAt: unknown;
}

/**
 * 정산 데이터
 */
export interface SettlementData {
  perPersonAmount: number;
  members: {
    [memberId: string]: {
      settled: boolean;
      settledAt?: unknown;
    };
  };
}

/**
 * 동승 요청 상태 정보
 */
export interface JoinRequestStatus {
  requestId: string;
  partyId: string;
  status: 'pending' | 'accepted' | 'declined' | 'canceled';
}

/**
 * 파티 채팅 메시지 타입
 */
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

/**
 * 계좌 정보 메시지 데이터
 */
export interface AccountMessageData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

/**
 * 도착/정산 메시지 데이터
 */
export interface ArrivalMessageData {
  taxiFare: number;
  perPerson: number;
  memberCount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

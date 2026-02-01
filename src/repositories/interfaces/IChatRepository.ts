// SKTaxi: Chat Repository 인터페이스 - DIP 원칙 적용
// 채팅방과 메시지 관련 데이터 접근 추상화

import { ChatMessage, ChatRoom } from '../../types/firestore';
import { Unsubscribe, SubscriptionCallbacks } from './IPartyRepository';

/**
 * 채팅방 카테고리 타입
 */
export type ChatRoomCategory = 'all' | 'university' | 'department' | 'game' | 'custom';

/**
 * 카테고리별 채팅방 필터 옵션
 */
export interface ChatRoomFilter {
  category: ChatRoomCategory;
  userId?: string;
  department?: string;
}

/**
 * 페이지네이션 결과 타입
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  cursor: unknown; // Firestore DocumentSnapshot 또는 Mock용 커서
}

/**
 * 메시지 구독 콜백 (새 메시지 수신용)
 */
export interface MessageSubscriptionCallbacks {
  onNewMessages: (messages: ChatMessage[]) => void;
  onError: (error: Error) => void;
}

/**
 * 채팅방 읽음 상태 타입
 */
export interface ChatRoomState {
  lastReadAt?: unknown;
}

/**
 * 채팅방 읽음 상태 맵 (chatRoomId -> state)
 */
export type ChatRoomStatesMap = Record<string, ChatRoomState>;

/**
 * Chat Repository 인터페이스
 */
export interface IChatRepository {
  // === 채팅방 관련 ===

  /**
   * 채팅방 목록 실시간 구독
   * @param userId - 현재 사용자 ID (멤버인 채팅방만 필터)
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRooms(userId: string, callbacks: SubscriptionCallbacks<ChatRoom[]>): Unsubscribe;

  /**
   * 카테고리별 채팅방 목록 실시간 구독
   * @param filter - 카테고리 필터 옵션
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>
  ): Unsubscribe;

  /**
   * 특정 채팅방 실시간 구독
   * @param chatRoomId - 채팅방 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRoom(chatRoomId: string, callbacks: SubscriptionCallbacks<ChatRoom | null>): Unsubscribe;

  /**
   * 채팅방 생성
   * @param chatRoom - 채팅방 데이터
   * @returns 생성된 채팅방 ID
   */
  createChatRoom(chatRoom: Omit<ChatRoom, 'id'>): Promise<string>;

  /**
   * 채팅방 참여
   * @param chatRoomId - 채팅방 ID
   * @param userId - 참여할 사용자 ID
   */
  joinChatRoom(chatRoomId: string, userId: string): Promise<void>;

  /**
   * 채팅방 나가기
   * @param chatRoomId - 채팅방 ID
   * @param userId - 나갈 사용자 ID
   */
  leaveChatRoom(chatRoomId: string, userId: string): Promise<void>;

  // === 메시지 관련 ===

  /**
   * 초기 메시지 로드 (최신 N개)
   * @param chatRoomId - 채팅방 ID
   * @param limit - 가져올 메시지 수
   * @returns 페이지네이션 결과
   */
  getInitialMessages(chatRoomId: string, limit: number): Promise<PaginatedResult<ChatMessage>>;

  /**
   * 이전 메시지 로드 (페이지네이션)
   * @param chatRoomId - 채팅방 ID
   * @param cursor - 이전 조회의 커서
   * @param limit - 가져올 메시지 수
   * @returns 페이지네이션 결과
   */
  getOlderMessages(chatRoomId: string, cursor: unknown, limit: number): Promise<PaginatedResult<ChatMessage>>;

  /**
   * 새 메시지 실시간 구독 (특정 시점 이후)
   * @param chatRoomId - 채팅방 ID
   * @param afterTimestamp - 이 시점 이후의 메시지만 구독
   * @param callbacks - 새 메시지 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToNewMessages(
    chatRoomId: string,
    afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks
  ): Unsubscribe;

  /**
   * 메시지 전송
   * @param chatRoomId - 채팅방 ID
   * @param message - 전송할 메시지 데이터
   */
  sendMessage(chatRoomId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<void>;

  // === 알림 설정 ===

  /**
   * 채팅방 알림 설정 조회
   * @param chatRoomId - 채팅방 ID
   * @param userId - 사용자 ID
   * @returns 알림 활성화 여부
   */
  getNotificationSetting(chatRoomId: string, userId: string): Promise<boolean>;

  /**
   * 채팅방 알림 설정 변경
   * @param chatRoomId - 채팅방 ID
   * @param userId - 사용자 ID
   * @param enabled - 알림 활성화 여부
   */
  updateNotificationSetting(chatRoomId: string, userId: string, enabled: boolean): Promise<void>;

  // === 채팅방 상태 관련 (ChatListScreen 지원) ===

  /**
   * 사용자의 모든 채팅방 상태 실시간 구독 (읽음 상태 등)
   * @param userId - 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>
  ): Unsubscribe;

  /**
   * 사용자의 채팅방 알림 설정 실시간 구독
   * @param userId - 사용자 ID
   * @param callbacks - 데이터 및 에러 콜백 (채팅방ID -> 알림활성화여부)
   * @returns 구독 해제 함수
   */
  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>
  ): Unsubscribe;

  /**
   * 채팅방 읽음 시간 업데이트
   * @param userId - 사용자 ID
   * @param chatRoomId - 채팅방 ID
   */
  updateLastReadAt(userId: string, chatRoomId: string): Promise<void>;
}

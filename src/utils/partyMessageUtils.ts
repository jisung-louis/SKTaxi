// SKTaxi: 파티 채팅 메시지 유틸리티 함수
// IPartyRepository를 사용하여 Firebase Firestore 직접 의존 제거

import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { logEvent } from '../lib/analytics';
import {
  AccountMessageData,
  ArrivalMessageData,
} from '../repositories/interfaces/IPartyRepository';
import { FirestorePartyRepository } from '../repositories/firestore/FirestorePartyRepository';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const partyRepository = new FirestorePartyRepository();

/**
 * 파티 채팅 일반 메시지 전송
 * @param partyId - 파티 ID
 * @param text - 메시지 텍스트
 */
export async function sendMessage(partyId: string, text: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!text.trim()) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    await partyRepository.sendPartyMessage(partyId, user.uid, text);

    await logEvent('chat_message_sent', {
      party_id: partyId,
      message_length: text.trim().length,
    });
  } catch (error) {
    console.error('sendMessage: Error sending message:', error);
    throw error;
  }
}

/**
 * 파티 채팅 시스템 메시지 전송
 * @param partyId - 파티 ID
 * @param text - 메시지 텍스트
 */
export async function sendSystemMessage(partyId: string, text: string): Promise<void> {
  try {
    await partyRepository.sendSystemMessage(partyId, text);
  } catch (error) {
    console.error('sendSystemMessage: Error sending system message:', error);
    throw error;
  }
}

/**
 * 파티 채팅 계좌 정보 메시지 전송
 * @param partyId - 파티 ID
 * @param accountData - 계좌 정보
 */
export async function sendAccountMessage(
  partyId: string,
  accountData: AccountMessageData
): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    await partyRepository.sendAccountMessage(partyId, user.uid, accountData);
  } catch (error) {
    console.error('sendAccountMessage: Error sending account message:', error);
    throw error;
  }
}

/**
 * 파티 채팅 도착 메시지 전송
 * @param partyId - 파티 ID
 * @param arrivalData - 도착/정산 정보
 */
export async function sendArrivedMessage(
  partyId: string,
  arrivalData: ArrivalMessageData
): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    await partyRepository.sendArrivedMessage(partyId, user.uid, arrivalData);
  } catch (error) {
    console.error('sendArrivedMessage: Error sending arrived message:', error);
    throw error;
  }
}

/**
 * 파티 채팅 동승 종료 메시지 전송
 * @param partyId - 파티 ID
 * @param partyArrived - 도착 여부
 */
export async function sendEndMessage(partyId: string, partyArrived: boolean): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    await partyRepository.sendEndMessage(partyId, user.uid, partyArrived);
  } catch (error) {
    console.error('sendEndMessage: Error sending end message:', error);
    throw error;
  }
}

// 타입 re-export
export type { AccountMessageData, ArrivalMessageData };

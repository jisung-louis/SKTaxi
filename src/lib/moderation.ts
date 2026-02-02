// SKTaxi: 신고/차단 관리 유틸리티
// IModerationRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { getAuth } from '@react-native-firebase/auth';
import { FirestoreModerationRepository } from '../repositories/firestore/FirestoreModerationRepository';
import {
  ReportPayload,
  ReportTargetType,
  ReportCategory,
  ReportStatus,
  ReportDoc,
  BlockedUser,
} from '../repositories/interfaces/IModerationRepository';

// 타입 re-export (기존 코드 호환성)
export type { ReportTargetType, ReportCategory, ReportStatus, ReportPayload, ReportDoc, BlockedUser };

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const moderationRepository = new FirestoreModerationRepository();

// 신고 생성
export async function createReport(payload: ReportPayload): Promise<string> {
  const current = getAuth().currentUser;
  if (!current) throw new Error('Not signed in');
  return moderationRepository.createReport(current.uid, payload);
}

// 차단 문서: blocks/{uid}/blockedUsers/{blockedUid}
export async function blockUser(blockedUserId: string): Promise<void> {
  const current = getAuth().currentUser;
  if (!current) throw new Error('Not signed in');
  await moderationRepository.blockUser(current.uid, blockedUserId);
}

export async function unblockUser(blockedUserId: string): Promise<void> {
  const current = getAuth().currentUser;
  if (!current) throw new Error('Not signed in');
  await moderationRepository.unblockUser(current.uid, blockedUserId);
}

export async function isBlocked(authorId: string, byUserId?: string): Promise<boolean> {
  const current = getAuth().currentUser;
  const viewerId = byUserId ?? current?.uid;
  if (!viewerId) return false;
  return moderationRepository.isBlocked(viewerId, authorId);
}

// 상호차단(양방향) 여부 확인: viewer가 author를 차단했거나, author가 viewer를 차단했으면 숨김
export async function isMutuallyBlocked(authorId: string): Promise<boolean> {
  const current = getAuth().currentUser;
  const viewerId = current?.uid;
  if (!viewerId) return false;
  return moderationRepository.isMutuallyBlocked(viewerId, authorId);
}

// 리스트 필터링용 헬퍼: authorId가 차단 관계이면 숨겨야 함
export async function shouldHideContent(authorId: string): Promise<boolean> {
  return await isMutuallyBlocked(authorId);
}

// 관리자: 열려있는 신고 수 카운트
export async function countOpenReports(): Promise<number> {
  return moderationRepository.countOpenReports();
}

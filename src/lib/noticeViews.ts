// SKTaxi: 공지사항 조회수 관리 유틸리티
// INoticeRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { FirestoreNoticeRepository } from '../repositories/firestore/FirestoreNoticeRepository';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const noticeRepository = new FirestoreNoticeRepository();

// 세션 내에서 중복 조회 증가를 방지하기 위한 메모리 캐시
const viewedNoticeIds = new Set<string>();

/**
 * 공지 상세 화면 진입 시 Firestore viewCount를 1 증가시킵니다.
 * 동일 세션에서 이미 증가한 공지는 다시 증가시키지 않습니다.
 */
export async function incrementNoticeViewCount(noticeId: string | undefined | null) {
  if (!noticeId || viewedNoticeIds.has(noticeId)) return;

  viewedNoticeIds.add(noticeId);
  try {
    await noticeRepository.incrementViewCount(noticeId);
  } catch (error) {
    console.error('공지 조회수 증가 실패:', error);
    // 실패 시 다시 시도할 수 있도록 캐시에서 제거
    viewedNoticeIds.delete(noticeId);
  }
}

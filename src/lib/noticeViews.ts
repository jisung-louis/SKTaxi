import { getFirestore, doc, updateDoc, increment } from '@react-native-firebase/firestore';

// SKTaxi: 세션 내에서 중복 조회 증가를 방지하기 위한 메모리 캐시
const viewedNoticeIds = new Set<string>();

/**
 * 공지 상세 화면 진입 시 Firestore viewCount를 1 증가시킵니다.
 * 동일 세션에서 이미 증가한 공지는 다시 증가시키지 않습니다.
 */
export async function incrementNoticeViewCount(noticeId: string | undefined | null) {
  if (!noticeId || viewedNoticeIds.has(noticeId)) return;

  viewedNoticeIds.add(noticeId);
  try {
    const db = getFirestore();
    const noticeRef = doc(db, 'notices', noticeId);
    await updateDoc(noticeRef, {
      viewCount: increment(1),
    });
  } catch (error) {
    console.error('공지 조회수 증가 실패:', error);
    // 실패 시 다시 시도할 수 있도록 캐시에서 제거
    viewedNoticeIds.delete(noticeId);
  }
}



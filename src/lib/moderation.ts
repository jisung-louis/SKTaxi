import firestore, { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, deleteDoc, query, where, getDocs } from '@react-native-firebase/firestore';
import { authInstance, firestoreInstance } from '../libs/firebase';

export type ReportTargetType = 'post' | 'comment' | 'chat_message' | 'profile';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string; // postId, commentId, messageId 등
  targetAuthorId: string;
  category: '스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타';
  reasonText?: string;
  screenshotUrls?: string[];
}

export interface ReportDoc extends ReportPayload {
  reporterId: string;
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

// 신고 생성
export async function createReport(payload: ReportPayload): Promise<string> {
  const db = firestoreInstance();
  const current = authInstance().currentUser;
  if (!current) throw new Error('Not signed in');
  const ref = await addDoc(collection(db, 'reports'), {
    ...payload,
    reporterId: current.uid,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as ReportDoc);
  return ref.id;
}

// 차단 문서: blocks/{uid}/blockedUsers/{blockedUid}
export async function blockUser(blockedUserId: string): Promise<void> {
  const db = firestoreInstance();
  const current = authInstance().currentUser;
  if (!current) throw new Error('Not signed in');
  const ref = doc(db, 'blocks', current.uid, 'blockedUsers', blockedUserId);
  await setDoc(ref, {
    blockedUserId,
    blockedBy: current.uid,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function unblockUser(blockedUserId: string): Promise<void> {
  const db = firestoreInstance();
  const current = authInstance().currentUser;
  if (!current) throw new Error('Not signed in');
  const ref = doc(db, 'blocks', current.uid, 'blockedUsers', blockedUserId);
  await deleteDoc(ref);
}

export async function isBlocked(authorId: string, byUserId?: string): Promise<boolean> {
  const db = firestoreInstance();
  const current = authInstance().currentUser;
  const viewerId = byUserId ?? current?.uid;
  if (!viewerId) return false;
  const ref = doc(db, 'blocks', viewerId, 'blockedUsers', authorId);
  const snap = await getDoc(ref);
  return snap.exists();
}

// 상호차단(양방향) 여부 확인: viewer가 author를 차단했거나, author가 viewer를 차단했으면 숨김
export async function isMutuallyBlocked(authorId: string): Promise<boolean> {
  const db = firestoreInstance();
  const current = authInstance().currentUser;
  const viewerId = current?.uid;
  if (!viewerId) return false;

  const aRef = doc(db, 'blocks', viewerId, 'blockedUsers', authorId);
  const bRef = doc(db, 'blocks', authorId, 'blockedUsers', viewerId);
  const [aSnap, bSnap] = await Promise.all([getDoc(aRef), getDoc(bRef)]);
  return aSnap.exists() || bSnap.exists();
}

// 리스트 필터링용 헬퍼: authorId가 차단 관계이면 숨겨야 함
export async function shouldHideContent(authorId: string): Promise<boolean> {
  return await isMutuallyBlocked(authorId);
}

// 관리자: 열려있는 신고 수 카운트
export async function countOpenReports(): Promise<number> {
  const db = firestoreInstance();
  const q = query(collection(db, 'reports'), where('status', '==', 'open'));
  const snaps = await getDocs(q);
  return snaps.size;
}



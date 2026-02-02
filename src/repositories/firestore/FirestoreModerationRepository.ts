// SKTaxi: Moderation Repository Firebase 구현체
// 신고/차단 관리 Firebase Firestore 구현

import {
  getFirestore,
  serverTimestamp,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import {
  IModerationRepository,
  ReportPayload,
  ReportDoc,
} from '../interfaces/IModerationRepository';

export class FirestoreModerationRepository implements IModerationRepository {
  private db = getFirestore();

  async createReport(reporterId: string, payload: ReportPayload): Promise<string> {
    const reportsCol = collection(this.db, 'reports');
    const docRef = await addDoc(reportsCol, {
      ...payload,
      reporterId,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as ReportDoc);
    return docRef.id;
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const ref = doc(this.db, 'blocks', blockerId, 'blockedUsers', blockedUserId);

    await setDoc(ref, {
      blockedUserId,
      blockedBy: blockerId,
      createdAt: serverTimestamp(),
    }, { merge: true });
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const ref = doc(this.db, 'blocks', blockerId, 'blockedUsers', blockedUserId);
    await deleteDoc(ref);
  }

  async isBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const ref = doc(this.db, 'blocks', viewerId, 'blockedUsers', authorId);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const aRef = doc(this.db, 'blocks', viewerId, 'blockedUsers', authorId);
    const bRef = doc(this.db, 'blocks', authorId, 'blockedUsers', viewerId);

    const [aSnap, bSnap] = await Promise.all([getDoc(aRef), getDoc(bRef)]);
    return aSnap.exists() || bSnap.exists();
  }

  async countOpenReports(): Promise<number> {
    const reportsCol = collection(this.db, 'reports');
    const q = query(reportsCol, where('status', '==', 'open'));

    const snaps = await getDocs(q);
    return snaps.size;
  }
}

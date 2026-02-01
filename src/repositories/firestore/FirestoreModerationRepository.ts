// SKTaxi: Moderation Repository Firebase 구현체
// 신고/차단 관리 Firebase Firestore 구현

import firestore from '@react-native-firebase/firestore';
import {
  IModerationRepository,
  ReportPayload,
  ReportDoc,
} from '../interfaces/IModerationRepository';

export class FirestoreModerationRepository implements IModerationRepository {
  private db = firestore();

  async createReport(reporterId: string, payload: ReportPayload): Promise<string> {
    const ref = await this.db.collection('reports').add({
      ...payload,
      reporterId,
      status: 'open',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    } as ReportDoc);
    return ref.id;
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const ref = this.db
      .collection('blocks')
      .doc(blockerId)
      .collection('blockedUsers')
      .doc(blockedUserId);

    await ref.set({
      blockedUserId,
      blockedBy: blockerId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const ref = this.db
      .collection('blocks')
      .doc(blockerId)
      .collection('blockedUsers')
      .doc(blockedUserId);

    await ref.delete();
  }

  async isBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const ref = this.db
      .collection('blocks')
      .doc(viewerId)
      .collection('blockedUsers')
      .doc(authorId);

    const snap = await ref.get();
    return snap.exists();
  }

  async isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const aRef = this.db
      .collection('blocks')
      .doc(viewerId)
      .collection('blockedUsers')
      .doc(authorId);

    const bRef = this.db
      .collection('blocks')
      .doc(authorId)
      .collection('blockedUsers')
      .doc(viewerId);

    const [aSnap, bSnap] = await Promise.all([aRef.get(), bRef.get()]);
    return aSnap.exists() || bSnap.exists();
  }

  async countOpenReports(): Promise<number> {
    const q = this.db
      .collection('reports')
      .where('status', '==', 'open');

    const snaps = await q.get();
    return snaps.size;
  }
}

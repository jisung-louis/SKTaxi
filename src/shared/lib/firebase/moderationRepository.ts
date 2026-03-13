import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';

import type {
  IModerationRepository,
  ReportDoc,
  ReportPayload,
} from '@/shared/lib/moderation/contracts';

import { db } from './firestore';

export class FirestoreModerationRepository implements IModerationRepository {
  private readonly firestore = db;

  async createReport(
    reporterId: string,
    payload: ReportPayload,
  ): Promise<string> {
    const reportsCollection = collection(this.firestore, 'reports');
    const reportRef = await addDoc(reportsCollection, {
      ...payload,
      reporterId,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as ReportDoc);
    return reportRef.id;
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const blockedUserRef = doc(
      this.firestore,
      'blocks',
      blockerId,
      'blockedUsers',
      blockedUserId,
    );

    await setDoc(
      blockedUserRef,
      {
        blockedUserId,
        blockedBy: blockerId,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const blockedUserRef = doc(
      this.firestore,
      'blocks',
      blockerId,
      'blockedUsers',
      blockedUserId,
    );
    await deleteDoc(blockedUserRef);
  }

  async isBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const blockedUserRef = doc(
      this.firestore,
      'blocks',
      viewerId,
      'blockedUsers',
      authorId,
    );
    const snapshot = await getDoc(blockedUserRef);
    return snapshot.exists();
  }

  async isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const viewerBlockRef = doc(
      this.firestore,
      'blocks',
      viewerId,
      'blockedUsers',
      authorId,
    );
    const authorBlockRef = doc(
      this.firestore,
      'blocks',
      authorId,
      'blockedUsers',
      viewerId,
    );

    const [viewerBlockSnapshot, authorBlockSnapshot] = await Promise.all([
      getDoc(viewerBlockRef),
      getDoc(authorBlockRef),
    ]);
    return viewerBlockSnapshot.exists() || authorBlockSnapshot.exists();
  }

  async countOpenReports(): Promise<number> {
    const reportsCollection = collection(this.firestore, 'reports');
    const openReportsQuery = query(
      reportsCollection,
      where('status', '==', 'open'),
    );
    const snapshots = await getDocs(openReportsQuery);
    return snapshots.size;
  }
}

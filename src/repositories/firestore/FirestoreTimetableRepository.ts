// SKTaxi: Timetable Repository Firestore 구현체

import firestore, {
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import {
  ITimetableRepository,
  Timetable,
} from '../interfaces/ITimetableRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../../api/types';

/**
 * Firestore 기반 Timetable Repository 구현체
 * userTimetables 컬렉션의 courseId 배열만 관리
 */
export class FirestoreTimetableRepository implements ITimetableRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly timetablesCollection = 'userTimetables';

  constructor() {
    this.db = firestore(getApp());
  }

  /**
   * 사용자의 특정 학기 시간표 문서 찾기
   */
  private async findTimetableDoc(
    userId: string,
    semester: string
  ): Promise<FirebaseFirestoreTypes.DocumentSnapshot | null> {
    const q = query(
      collection(this.db, this.timetablesCollection),
      where('userId', '==', userId),
      where('semester', '==', semester)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0];
  }

  subscribeToTimetable(
    userId: string,
    semester: string,
    callbacks: SubscriptionCallbacks<Timetable | null>
  ): Unsubscribe {
    // 쿼리로 실시간 구독 (userId + semester)
    const q = query(
      collection(this.db, this.timetablesCollection),
      where('userId', '==', userId),
      where('semester', '==', semester)
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        if (!snapshot.empty) {
          const docSnapshot = snapshot.docs[0];
          const data = docSnapshot.data();
          callbacks.onData({
            userId: data?.userId || userId,
            semester: data?.semester || semester,
            courses: data?.courses || [],
            updatedAt: data?.updatedAt?.toDate() || new Date(),
          });
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async updateCourseIds(
    userId: string,
    semester: string,
    courseIds: string[]
  ): Promise<void> {
    const existingDoc = await this.findTimetableDoc(userId, semester);

    if (existingDoc) {
      await updateDoc(existingDoc.ref, {
        courses: courseIds,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(this.db, this.timetablesCollection), {
        userId,
        semester,
        courses: courseIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
}

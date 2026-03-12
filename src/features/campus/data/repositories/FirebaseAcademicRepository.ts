// SKTaxi: Academic Repository Firestore 구현체

import { getFirestore, collection, getDocs, query, orderBy } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { AcademicSchedule } from '../../model/academic';

import { IAcademicRepository } from './IAcademicRepository';

/**
 * Firestore 기반 Academic Repository 구현체
 */
export class FirebaseAcademicRepository implements IAcademicRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly schedulesCollection = 'academicSchedules';

  constructor() {
    this.db = getFirestore();
  }

  async getSchedules(): Promise<AcademicSchedule[]> {
    const schedulesRef = collection(this.db, this.schedulesCollection);
    const q = query(schedulesRef, orderBy('startDate', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || '',
        startDate: data.startDate || '',
        endDate: data.endDate || data.startDate || '',
        category: data.category || 'general',
        description: data.description || '',
      };
    });
  }

  async getSchedulesByDateRange(startDate: Date, endDate: Date): Promise<AcademicSchedule[]> {
    const allSchedules = await this.getSchedules();

    // 클라이언트 사이드 필터링 (Firestore 날짜 비교의 복잡성 회피)
    return allSchedules.filter((schedule) => {
      const scheduleStart = new Date(schedule.startDate);
      const scheduleEnd = new Date(schedule.endDate || schedule.startDate);

      // 일정이 주어진 기간과 겹치는지 확인
      return scheduleStart <= endDate && scheduleEnd >= startDate;
    });
  }
}

export { FirebaseAcademicRepository as FirestoreAcademicRepository };

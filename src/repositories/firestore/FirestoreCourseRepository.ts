// SKTaxi: Course Repository Firestore 구현체

import firestore, {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import { Course } from '../../types/timetable';
import { ICourseRepository } from '../interfaces/ICourseRepository';

/**
 * Firestore 기반 Course Repository 구현체
 */
export class FirestoreCourseRepository implements ICourseRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly collectionName = 'courses';

  constructor() {
    this.db = firestore(getApp());
  }

  async getCoursesBySemester(semester: string): Promise<Course[]> {
    const coursesRef = collection(this.db, this.collectionName);
    const q = query(
      coursesRef,
      where('semester', '==', semester),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const data: any = docSnap.data();
      courses.push(this.mapToCourse(docSnap.id, data));
    });

    return courses;
  }

  async searchCourses(semester: string, searchTerm: string): Promise<Course[]> {
    // Firestore는 클라이언트 사이드 검색이 제한적이므로
    // 전체 데이터를 가져온 후 필터링
    const allCourses = await this.getCoursesBySemester(semester);

    const lowerSearchTerm = searchTerm.toLowerCase();
    return allCourses.filter(course =>
      course.name.toLowerCase().includes(lowerSearchTerm) ||
      course.professor.toLowerCase().includes(lowerSearchTerm) ||
      course.code.toLowerCase().includes(lowerSearchTerm)
    );
  }

  async getCourse(courseId: string): Promise<Course | null> {
    const docRef = doc(this.db, this.collectionName, courseId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return this.mapToCourse(snapshot.id, snapshot.data() as any);
    }

    return null;
  }

  private mapToCourse(id: string, data: any): Course {
    return {
      id,
      grade: data.grade || 1,
      category: data.category || '',
      code: data.code || '',
      division: data.division || '',
      name: data.name || '',
      credits: data.credits || 0,
      professor: data.professor || '',
      schedule: data.schedule || [],
      location: data.location || '',
      note: data.note,
      semester: data.semester || '',
      department: data.department,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };
  }
}

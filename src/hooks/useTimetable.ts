import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';
import { UserTimetable, Course, TimetableCourse } from '../types/timetable';
import { getTodayCourses, findOverlappingCourses } from '../utils/timetableUtils';
import { TIMETABLE_COURSE_COLORS, assignColor } from '../constants/colorPalettes';

export const useTimetable = (semester: string) => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<UserTimetable | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 수업에 컬러 할당하는 함수
  const assignColorToCourse = useCallback((course: Course, index: number): TimetableCourse => {
    return {
      ...course,
      color: assignColor(index, TIMETABLE_COURSE_COLORS),
    };
  }, []);

  // 사용자 시간표 실시간 구독
  const loadUserTimetable = useCallback(() => {
    if (!user) return () => {}; // 빈 함수 반환

    setLoading(true);
    setError(null);

    const db = getFirestore();
    const timetablesRef = collection(db, 'userTimetables');
    const q = query(
      timetablesRef,
      where('userId', '==', user.uid),
      where('semester', '==', semester)
    );
    
    // 실시간 구독 시작
    const unsubscribe = onSnapshot(q, 
      async (querySnapshot) => {
        try {
          if (!querySnapshot.empty) {
            const timetableData = querySnapshot.docs[0].data() as UserTimetable;
            setTimetable({
              ...timetableData,
              createdAt: (timetableData.createdAt as any)?.toDate?.() || new Date(),
              updatedAt: (timetableData.updatedAt as any)?.toDate?.() || new Date(),
            });
            
            // 시간표의 수업들 로드
            await loadCourses(timetableData.courses);
          } else {
            // 새 시간표 생성
            const newTimetable: UserTimetable = {
              id: '',
              userId: user.uid,
              semester,
              courses: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setTimetable(newTimetable);
            setCourses([]);
          }
        } catch (err) {
          console.error('Failed to process timetable data:', err);
          setError('시간표 데이터 처리에 실패했습니다.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Failed to load user timetable:', err);
        setError('시간표를 불러올 수 없습니다.');
        setLoading(false);
      }
    );

    return unsubscribe; // 구독 해제 함수 반환
  }, [user, semester]);

  // 수업 데이터 로드
  const loadCourses = useCallback(async (courseIds: string[]) => {
    if (courseIds.length === 0) {
      setCourses([]);
      return;
    }

    try {
      const db = getFirestore();
      const coursesRef = collection(db, 'courses');
      const coursesData: Course[] = [];

      for (const courseId of courseIds) {
        const courseDoc = await getDoc(doc(coursesRef, courseId));
        if (courseDoc.exists()) {
          const data: any = courseDoc.data();
          if (data) {
            coursesData.push({
              id: courseDoc.id,
              grade: data.grade ?? 1,
              category: data.category ?? '',
              code: data.code ?? '',
              division: data.division ?? '',
              name: data.name ?? '',
              credits: data.credits ?? 0,
              professor: data.professor ?? '',
              schedule: data.schedule ?? [],
              location: data.location ?? '',
              note: data.note,
              semester: data.semester ?? '',
              department: data.department,
              createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
              updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
            });
          }
        }
      }

      // 컬러 할당하여 TimetableCourse로 변환
      const coursesWithColor = coursesData.map((course, index) => 
        assignColorToCourse(course, index)
      );
      
      setCourses(coursesWithColor);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError('수업 정보를 불러오는데 실패했습니다.');
    }
  }, []);

  // 수업 추가 (겹치는 수업 자동 삭제)
  const addCourse = useCallback(async (course: Course) => {
    if (!user || !timetable) {
      console.error('User or timetable not found');
      return;
    }

    try {
      const db = getFirestore();
      
      // 겹치는 수업들 찾기
      const overlappingCourses = findOverlappingCourses(course, courses);
      
      // 겹치는 수업들을 제외한 새로운 수업 목록 생성
      const overlappingCourseIds = overlappingCourses.map(c => c.id);
      const filteredCourseIds = timetable.courses.filter(id => !overlappingCourseIds.includes(id));
      const newCourseIds = [...filteredCourseIds, course.id];
      
      // 새 시간표인 경우 먼저 저장
      if (!timetable.id) {
        const newTimetableRef = doc(collection(db, 'userTimetables'));
        const newTimetable = {
          ...timetable,
          id: newTimetableRef.id,
          courses: newCourseIds,
          updatedAt: new Date(),
        };
        await setDoc(newTimetableRef, newTimetable);
        setTimetable(newTimetable);
      } else {
        const timetableRef = doc(db, 'userTimetables', timetable.id);
        await updateDoc(timetableRef, {
          courses: newCourseIds,
          updatedAt: new Date(),
        });
      }

      // 로컬 상태 업데이트
      setTimetable(prev => prev ? {
        ...prev,
        courses: newCourseIds,
        updatedAt: new Date(),
      } : null);

      // 겹치는 수업들을 로컬 상태에서도 제거하고 새 수업 추가
      setCourses(prev => {
        const filteredCourses = prev.filter(c => !overlappingCourseIds.includes(c.id));
        const courseWithColor = assignColorToCourse(course, filteredCourses.length);
        return [...filteredCourses, courseWithColor];
      });
    } catch (err: any) {
      console.error('Failed to add course:', err);
      setError('수업 추가에 실패했습니다.');
    }
  }, [user, timetable, courses]);

  // 수업 제거
  const removeCourse = useCallback(async (courseId: string) => {
    if (!user || !timetable) return;

    try {
      const db = getFirestore();
      const newCourseIds = timetable.courses.filter(id => id !== courseId);
      
      const timetableRef = doc(db, 'userTimetables', timetable.id);
      await updateDoc(timetableRef, {
        courses: newCourseIds,
        updatedAt: new Date(),
      });

      // 로컬 상태 업데이트
      setTimetable(prev => prev ? {
        ...prev,
        courses: newCourseIds,
        updatedAt: new Date(),
      } : null);

      // 수업 목록에서 제거
      setCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (err: any) {
      console.error('Failed to remove course:', err);
      setError('수업 제거에 실패했습니다.');
    }
  }, [user, timetable]);

  // 오늘의 수업 가져오기
  const getTodayCoursesList = useCallback(() => {
    return getTodayCourses(courses);
  }, [courses]);

  // 시간표 저장 (새 시간표 생성)
  const saveTimetable = useCallback(async () => {
    if (!user || !timetable) return;

    try {
      const db = getFirestore();
      const timetableRef = doc(collection(db, 'userTimetables'));
      
      const newTimetable = {
        ...timetable,
        id: timetableRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(timetableRef, newTimetable);
      setTimetable(newTimetable);
    } catch (err: any) {
      console.error('Failed to save timetable:', err);
      setError('시간표 저장에 실패했습니다.');
    }
  }, [user, timetable]);

  useEffect(() => {
    const unsubscribe = loadUserTimetable();
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadUserTimetable]);

  return {
    timetable,
    courses,
    loading,
    error,
    addCourse,
    removeCourse,
    getTodayCourses: getTodayCoursesList,
    saveTimetable,
    refetch: loadUserTimetable,
  };
};

// SKTaxi: useTimetable 훅 - Repository 패턴 적용
// ITimetableRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRepository } from '../../di';
import { useAuth } from '../auth';
import { UserTimetable, Course, TimetableCourse } from '../../types/timetable';
import { logEvent } from '../../lib/analytics';
import { getTodayCourses, findOverlappingCourses } from '../../utils/timetableUtils';
import { TIMETABLE_COURSE_COLORS, assignColor } from '../../constants/colorPalettes';

export const useTimetable = (semester: string) => {
  const { user } = useAuth();
  const { timetableRepository, courseRepository } = useRepository();
  
  const [timetable, setTimetable] = useState<UserTimetable | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isFirstLoadRef = useRef(true);
  const lastCourseIdsRef = useRef<string>('');

  // 수업에 컬러 할당
  const assignColorToCourse = useCallback(
    (course: Course, index: number): TimetableCourse => {
      return {
        ...course,
        color: assignColor(index, TIMETABLE_COURSE_COLORS),
      };
    },
    []
  );

  // 수업 데이터 로드
  const loadCourses = useCallback(
    async (courseIds: string[]) => {
      if (courseIds.length === 0) {
        setCourses((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      try {
        // courseRepository를 통해 수업 데이터 조회
        const coursesData: Course[] = [];
        
        for (const courseId of courseIds) {
          const course = await courseRepository.getCourse(courseId);
          if (course) {
            coursesData.push(course as Course);
          }
        }

        // 컬러 할당
        const coursesWithColor = coursesData.map((course, index) =>
          assignColorToCourse(course, index)
        );

        setCourses((prev) => {
          if (prev.length !== coursesWithColor.length) {
            return coursesWithColor;
          }
          const prevIds = prev.map((c) => c.id).sort().join(',');
          const newIds = coursesWithColor.map((c) => c.id).sort().join(',');
          if (prevIds === newIds) {
            return prev;
          }
          return coursesWithColor;
        });
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('수업 정보를 불러오는데 실패했습니다.');
      }
    },
    [courseRepository, assignColorToCourse]
  );

  // 시간표 실시간 구독
  useEffect(() => {
    if (!user) {
      setTimetable(null);
      setCourses([]);
      setLoading(false);
      return;
    }

    isFirstLoadRef.current = true;
    lastCourseIdsRef.current = '';
    setLoading(true);
    setError(null);

    const unsubscribe = timetableRepository.subscribeToTimetable(
      user.uid,
      semester,
      {
        onData: (data) => {
          if (data) {
            // data.courses는 이제 string[] (courseId 배열)
            const newCourseIds = data.courses
              .sort()
              .join(',');

            if (!isFirstLoadRef.current && lastCourseIdsRef.current === newCourseIds) {
              return;
            }

            lastCourseIdsRef.current = newCourseIds;

            const newTimetable: UserTimetable = {
              id: `${user.uid}_${semester}`,
              userId: user.uid,
              semester,
              courses: data.courses, // 이미 string[] 형태
              createdAt: data.updatedAt,
              updatedAt: data.updatedAt,
            };

            setTimetable(newTimetable);
            loadCourses(newTimetable.courses);
            isFirstLoadRef.current = false;
          } else {
            // 빈 시간표
            if (!isFirstLoadRef.current && lastCourseIdsRef.current === '') {
              return;
            }
            lastCourseIdsRef.current = '';
            
            setTimetable({
              id: '',
              userId: user.uid,
              semester,
              courses: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            setCourses([]);
            isFirstLoadRef.current = false;
          }
          setLoading(false);
        },
        onError: (err) => {
          console.error('Failed to load timetable:', err);
          setError('시간표를 불러올 수 없습니다.');
          setLoading(false);
        },
      }
    );

    return () => unsubscribe();
  }, [user, semester, timetableRepository, loadCourses]);

  // 수업 추가
  const addCourse = useCallback(
    async (course: Course) => {
      if (!user || !timetable) {
        console.error('User or timetable not found');
        return;
      }

      try {
        // 겹치는 수업 찾기
        const overlappingCourses = findOverlappingCourses(course, courses);
        const overlappingCourseIds = overlappingCourses.map((c) => c.id);

        // 새 수업 목록
        const filteredCourseIds = timetable.courses.filter(
          (id) => !overlappingCourseIds.includes(id)
        );
        const newCourseIds = [...filteredCourseIds, course.id];

        // Repository를 통해 강의 ID 목록만 업데이트
        await timetableRepository.updateCourseIds(user.uid, semester, newCourseIds);

        // Analytics
        await logEvent('timetable_course_added', {
          course_id: course.id,
          course_name: course.name,
          semester,
          had_overlapping: overlappingCourses.length > 0,
          overlapping_count: overlappingCourses.length,
        });
      } catch (err) {
        console.error('Failed to add course:', err);
        setError('수업 추가에 실패했습니다.');
      }
    },
    [user, timetable, courses, semester, timetableRepository]
  );

  // 수업 제거
  const removeCourse = useCallback(
    async (courseId: string) => {
      if (!user || !timetable) return;

      try {
        const newCourseIds = timetable.courses.filter((id) => id !== courseId);

        await timetableRepository.updateCourseIds(user.uid, semester, newCourseIds);
      } catch (err) {
        console.error('Failed to remove course:', err);
        setError('수업 제거에 실패했습니다.');
      }
    },
    [user, timetable, semester, timetableRepository]
  );

  // 오늘의 수업
  const getTodayCoursesList = useCallback(() => {
    return getTodayCourses(courses);
  }, [courses]);

  // 시간표 저장
  const saveTimetable = useCallback(async () => {
    if (!user || !timetable) return;

    try {
      await timetableRepository.updateCourseIds(user.uid, semester, timetable.courses);
    } catch (err) {
      console.error('Failed to save timetable:', err);
      setError('시간표 저장에 실패했습니다.');
    }
  }, [user, timetable, semester, timetableRepository]);

  return {
    timetable,
    courses,
    loading,
    error,
    addCourse,
    removeCourse,
    getTodayCourses: getTodayCoursesList,
    saveTimetable,
    refetch: () => {}, // 실시간 구독이므로 불필요
  };
};

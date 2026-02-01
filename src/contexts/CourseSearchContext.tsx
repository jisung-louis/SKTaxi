import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useCourseRepository } from '../di/useRepository';
import { Course } from '../types/timetable';

interface CourseSearchContextType {
  allCourses: Course[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  loadAllCourses: (semester: string) => Promise<void>;
  clearCache: () => void;
}

const CourseSearchContext = createContext<CourseSearchContextType | undefined>(undefined);

interface CourseSearchProviderProps {
  children: ReactNode;
}

export const CourseSearchProvider: React.FC<CourseSearchProviderProps> = ({ children }) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const courseRepository = useCourseRepository();

  // 전체 수업 데이터 로드
  const loadAllCourses = useCallback(async (semester: string) => {
    // 학기가 변경되었거나 캐시가 없는 경우에만 로드
    const currentSemester = allCourses.length > 0 ? allCourses[0].semester : null;
    if (isInitialized && currentSemester === semester) {
      console.log('📚 수업 데이터가 이미 캐시되어 있습니다.');
      return; // 이미 같은 학기 데이터가 로드된 경우 스킵
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📚 수업 데이터를 로드하는 중...');

      // Repository를 통해 수업 데이터 조회
      const coursesData = await courseRepository.getCoursesBySemester(semester);

      setAllCourses(coursesData);
      setIsInitialized(true);
      console.log(`📚 ${coursesData.length}개의 수업 데이터를 캐시했습니다.`);
    } catch (err) {
      console.error('수업 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '수업 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, allCourses.length, courseRepository]);

  // 캐시 초기화
  const clearCache = useCallback(() => {
    setAllCourses([]);
    setIsInitialized(false);
    setError(null);
    console.log('📚 수업 데이터 캐시를 초기화했습니다.');
  }, []);

  const value: CourseSearchContextType = {
    allCourses,
    loading,
    error,
    isInitialized,
    loadAllCourses,
    clearCache,
  };

  return (
    <CourseSearchContext.Provider value={value}>
      {children}
    </CourseSearchContext.Provider>
  );
};

export const useCourseSearchContext = () => {
  const context = useContext(CourseSearchContext);
  if (context === undefined) {
    throw new Error('useCourseSearchContext must be used within a CourseSearchProvider');
  }
  return context;
};

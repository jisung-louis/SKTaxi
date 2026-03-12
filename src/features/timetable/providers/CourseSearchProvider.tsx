import React, { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import { useCourseRepository } from '@/di/useRepository';

import { Course } from '../model/types';

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
  const loadedSemesterRef = useRef<string | null>(null);
  const courseRepository = useCourseRepository();

  // 전체 수업 데이터 로드
  const loadAllCourses = useCallback(async (semester: string) => {
    // 이미 같은 학기 데이터가 로드 중이거나 완료된 경우 스킵
    if (loadedSemesterRef.current === semester) {
      return;
    }

    // fetch 시작 전에 즉시 ref 설정 → 동시 중복 호출 방지
    loadedSemesterRef.current = semester;

    try {
      setLoading(true);
      setError(null);
      console.log('📚 수업 데이터를 로드하는 중...');

      const coursesData = await courseRepository.getCoursesBySemester(semester);

      setAllCourses(coursesData);
      setIsInitialized(true);
      console.log(`📚 ${coursesData.length}개의 수업 데이터를 캐시했습니다.`);
    } catch (err) {
      // 실패 시 ref 초기화 → 재시도 가능하도록
      loadedSemesterRef.current = null;
      console.error('수업 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '수업 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [courseRepository]);

  // 캐시 초기화
  const clearCache = useCallback(() => {
    setAllCourses([]);
    setIsInitialized(false);
    loadedSemesterRef.current = null;
    setError(null);
    console.log('📚 수업 데이터 캐시를 초기화했습니다.');
  }, []);

  const value = useMemo<CourseSearchContextType>(() => ({
    allCourses,
    loading,
    error,
    isInitialized,
    loadAllCourses,
    clearCache,
  }), [allCourses, loading, error, isInitialized, loadAllCourses, clearCache]);

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

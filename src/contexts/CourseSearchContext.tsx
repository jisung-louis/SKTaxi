import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs } from '@react-native-firebase/firestore';
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

      const db = getFirestore();
      const coursesRef = collection(db, 'courses');
      const q = query(
        coursesRef,
        where('semester', '==', semester),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const coursesData: Course[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        coursesData.push({
          id: doc.id,
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
          createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
          updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
        });
      });

      setAllCourses(coursesData);
      setIsInitialized(true);
      console.log(`📚 ${coursesData.length}개의 수업 데이터를 캐시했습니다.`);
    } catch (err) {
      console.error('수업 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '수업 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, allCourses.length]);

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

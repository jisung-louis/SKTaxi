import { useState, useEffect, useCallback } from 'react';
import { Course, CourseSearchFilter } from '../types/timetable';
import { useCourseSearchContext } from '../contexts/CourseSearchContext';

export const useCourseSearch = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 전역 캐시에서 데이터 가져오기
  const { allCourses, loading, error, isInitialized, loadAllCourses } = useCourseSearchContext();

  // 초기 데이터 로드 (전역 캐시 사용)
  const initializeCourses = useCallback(async (semester: string) => {
    await loadAllCourses(semester);
  }, [loadAllCourses]);

  // 로컬 검색 (캐시된 데이터에서 필터링)
  const searchLocalCourses = useCallback((query: string) => {
    if (!query.trim()) {
      setCourses(allCourses);
      return;
    }

    const filteredCourses = allCourses.filter(course => {
      const searchTerm = query.toLowerCase();
      return (
        course.name.toLowerCase().includes(searchTerm) ||
        course.code.toLowerCase().includes(searchTerm) ||
        course.professor.toLowerCase().includes(searchTerm) ||
        course.department?.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm) ||
        course.note?.toLowerCase().includes(searchTerm)
      );
    });

    setCourses(filteredCourses);
  }, [allCourses]);

  // 수업 검색 (기존 함수 - 호환성을 위해 유지)
  const searchCourses = useCallback(async (filter: CourseSearchFilter = {}) => {
    // 캐시된 데이터가 있으면 로컬 검색 사용
    if (isInitialized) {
      searchLocalCourses(filter.query || '');
      return;
    }

    // 캐시된 데이터가 없으면 초기 로드 (semester가 필수)
    if (filter.semester) {
      await initializeCourses(filter.semester);
    }
  }, [isInitialized, initializeCourses, searchLocalCourses]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 검색 실행 (로컬 검색 사용)
  const executeSearch = useCallback((filter: CourseSearchFilter = {}) => {
    if (isInitialized) {
      searchLocalCourses(filter.query || '');
    } else if (filter.semester) {
      initializeCourses(filter.semester);
    }
  }, [isInitialized, searchLocalCourses, initializeCourses]);

  // 초기 로드는 CourseSearch 컴포넌트에서 학기와 함께 호출됨

  return {
    courses,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchCourses,
    handleSearchChange,
    executeSearch,
    initializeCourses,
    searchLocalCourses,
    isInitialized,
  };
};




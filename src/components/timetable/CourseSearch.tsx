import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useCourseSearch } from '../../hooks/useCourseSearch';
import { CourseCard } from './CourseCard';
import { Course } from '../../types/timetable';
import { useAuth } from '../../hooks/useAuth';

interface CourseSearchProps {
  onCourseSelect?: (course: Course) => void;
  onCourseAdd?: (course: Course) => void;
  selectedCourseId?: string;
  semester?: string;
  currentCourses?: Course[]; // 현재 시간표에 추가된 수업 목록
}

export const CourseSearch: React.FC<CourseSearchProps> = ({
  onCourseSelect,
  onCourseAdd,
  selectedCourseId,
  semester,
  currentCourses = [],
}) => {
  const { courses, loading, error, searchQuery, setSearchQuery, executeSearch, isInitialized, initializeCourses } = useCourseSearch();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filterByMyDepartment, setFilterByMyDepartment] = useState(false);
  const { user } = useAuth();

  // 내 학과 필터링된 수업 목록
  const filteredCourses = useMemo(() => {
    if (!filterByMyDepartment || !user?.department) {
      return courses;
    }

    const userDepartment = user.department.toLowerCase().trim();
    
    return courses.filter(course => {
      // course.department와 user.department를 비교
      // 부분 일치도 허용 (예: "컴퓨터공학과"와 "컴퓨터공학" 모두 매칭)
      const courseDept = course.department?.toLowerCase().trim() || '';
      
      return courseDept.includes(userDepartment) || userDepartment.includes(courseDept);
    });
  }, [courses, filterByMyDepartment, user?.department]);

  // 학기 변경 시 초기화
  useEffect(() => {
    if (semester) {
      initializeCourses(semester);
    }
  }, [semester, initializeCourses]);

  // 검색어 변경 핸들러 (디바운싱) - 캐시된 데이터에서 즉시 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitialized) {
        executeSearch({ query: searchQuery, semester });
      }
    }, 100); // 디바운싱 시간 단축 (캐시 기반이므로 빠름)

    return () => clearTimeout(timeoutId);
  }, [searchQuery, semester, isInitialized, executeSearch]);

  const handleToggleDepartmentFilter = () => {
    setFilterByMyDepartment(prev => !prev);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleCoursePress = (course: Course) => {
    setSelectedCourse(course);
    onCourseSelect?.(course);
  };

  const handleAddToTimetable = (course: Course) => {
    onCourseAdd?.(course);
  };

  const renderCourse = ({ item }: { item: Course }) => {
    // 현재 시간표에 이미 추가된 수업인지 확인
    const isAlreadyAdded = currentCourses.some(course => course.id === item.id);
    
    return (
      <CourseCard
        course={item}
        isSelected={selectedCourseId === item.id}
        isAlreadyAdded={isAlreadyAdded}
        onPress={handleCoursePress}
        onAddToTimetable={handleAddToTimetable}
      />
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.emptyText}>수업을 검색하는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.text.secondary} />
          <Text style={styles.emptyText}>수업 검색에 실패했습니다.</Text>
          <Text style={styles.emptySubtext}>잠시 후 다시 시도해주세요.</Text>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={48} color={COLORS.text.secondary} />
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          <Text style={styles.emptySubtext}>다른 검색어를 시도해보세요.</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="book" size={48} color={COLORS.text.secondary} />
        <Text style={styles.emptyText}>수업을 검색해보세요</Text>
        <Text style={styles.emptySubtext}>수업명, 과목코드, 교수명, 학과명으로 검색할 수 있습니다.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 검색 입력 */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchMyDepartmentCheckboxContainer}
          onPress={handleToggleDepartmentFilter}
          disabled={!user?.department}
        >
          <Icon
            name={filterByMyDepartment ? "checkbox" : "square-outline"}
            size={20}
            color={filterByMyDepartment ? COLORS.accent.blue : COLORS.text.secondary}
          />
          <Text
            style={[
              styles.searchMyDepartmentCheckboxText,
              filterByMyDepartment && styles.searchMyDepartmentCheckboxTextActive,
              !user?.department && styles.searchMyDepartmentCheckboxTextDisabled,
            ]}
          >
            내 학과
          </Text>
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={18} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="수업명, 과목코드, 교수명, 학과명으로 검색..."
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Icon
              name="close-circle"
              size={20}
              color={COLORS.text.secondary}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      {/* 검색 결과 */}
      <View style={styles.resultsContainer}>
        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 120, // 각 아이템의 예상 높이
              offset: 120 * index,
              index,
            })}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  searchMyDepartmentCheckboxContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  searchMyDepartmentCheckboxText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
  },
  searchMyDepartmentCheckboxTextActive: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  searchMyDepartmentCheckboxTextDisabled: {
    opacity: 0.5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
});




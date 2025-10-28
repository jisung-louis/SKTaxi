import React, { useRef, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Course } from '../../types/timetable';
import { DAY_CELL_HEIGHT } from '../../constants/constants';
import { TimetableGrid } from './TimetableGrid';

interface TimetablePreviewProps {
  courses: Course[];
  selectedCourse?: Course | null;
  onCoursePress?: (course: Course) => void;
}

export const TimetablePreview: React.FC<TimetablePreviewProps> = ({
  courses,
  selectedCourse,
  onCoursePress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // 선택된 수업이 변경될 때 해당 위치로 스크롤
  useEffect(() => {
    if (!selectedCourse || !scrollViewRef.current) return;

    const saturday = 6;
    
    // 선택된 수업이 토요일 수업인지 확인
    const isSelectedSaturday = selectedCourse.schedule?.some(schedule => schedule.dayOfWeek === saturday);
    // 선택된 수업이 시간 정보 없는 수업인지 확인
    const isSelectedNoSchedule = selectedCourse.schedule === undefined || selectedCourse.schedule?.length === 0;

    // 토요일/시간정보 없는 수업은 하단 섹션에 표시 → 리스트 맨 아래로 스크롤
    if (isSelectedSaturday || isSelectedNoSchedule) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
      return;
    }

    // 일반 수업은 시작 교시 위치로 스크롤
    const courseSchedules = selectedCourse.schedule || [];
    if (courseSchedules.length > 0) {
      const firstSchedule = courseSchedules[0];
      const startPeriod = firstSchedule.startPeriod;

      // 스크롤 위치 계산 (교시 * 셀 높이)
      const scrollY = (startPeriod - 1) * DAY_CELL_HEIGHT;

      // 부드럽게 스크롤
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollY),
          animated: true
        });
      }, 50);
    }
  }, [selectedCourse]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 10 }}
      showsVerticalScrollIndicator={false}
      >
        <TimetableGrid 
          courses={courses}
          selectedCourse={selectedCourse}
          showPreview={true}
        />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
// 학사일정용 컬러 팔레트
export const ACADEMIC_SCHEDULE_COLORS = [
  '#FF6B6B', // 빨간색
  '#4ECDC4', // 청록색
  '#45B7D1', // 파란색
  '#96CEB4', // 연두색
  '#FFEAA7', // 노란색
  '#DDA0DD', // 보라색
];

// 시간표 수업용 컬러 팔레트
export const TIMETABLE_COURSE_COLORS = [
  '#3B82F6', // 파란색
  '#FF6B6B', // 빨간색
  '#8B5CF6', // 보라색
  '#FFEAA7', // 연한 노란색
  '#4ECDC4', // 청록색
  '#96CEB4', // 연두색
  '#DDA0DD', // 라벤더
  '#45B7D1', // 하늘색
];

// 컬러 할당 유틸 함수
export const assignColor = (index: number, colorPalette: string[]): string => {
  return colorPalette[index % colorPalette.length];
};

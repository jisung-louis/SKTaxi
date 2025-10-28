// 학사일정용 컬러 팔레트
export const ACADEMIC_SCHEDULE_COLORS = [
  '#FF6B6B', // 빨간색
  '#4ECDC4', // 청록색
  '#45B7D1', // 파란색
  '#96CEB4', // 연두색
  '#FFEAA7', // 노란색
  '#DDA0DD', // 보라색
];

// 시간표 수업용 컬러 팔레트 (파스텔 톤)
export const TIMETABLE_COURSE_COLORS = [
  '#FFB3BA', // 파스텔 핑크
  '#BAFFC9', // 파스텔 민트
  '#BAE1FF', // 파스텔 스카이블루
  '#FFFFBA', // 파스텔 옐로우
  '#FFDFBA', // 파스텔 피치
  '#D1BAFF', // 파스텔 라벤더
  '#FFCCCB', // 파스텔 로즈
  '#B4FFA5', // 파스텔 라임
  '#C4E8E6', // 파스텔 메리골드
  '#FFE5CC', // 파스텔 크림
];

// 컬러 할당 유틸 함수
export const assignColor = (index: number, colorPalette: string[]): string => {
  return colorPalette[index % colorPalette.length];
};

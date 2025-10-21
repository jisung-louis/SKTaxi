export interface AcademicSchedule {
  id: string;
  title: string;
  startDate: string;        // "2024-09-02"
  endDate: string;          // "2024-09-06"
  type: 'single' | 'multi'; // 단일일/여러일
  isPrimary?: boolean;      // 주요 일정 여부 (기본값: false)
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicScheduleWithColor extends AcademicSchedule {
  color: string;
}

// 색상 팔레트 (12개 색상)
export const SCHEDULE_COLORS = [
  '#FF6B6B', // 빨간색
  '#4ECDC4', // 청록색
  '#45B7D1', // 파란색
  '#96CEB4', // 연두색
  '#FFEAA7', // 노란색
  '#DDA0DD', // 보라색
  // '#FFB6C1', // 분홍색
  // '#98D8C8', // 민트색
  // '#F7DC6F', // 금색
  // '#BB8FCE', // 라벤더
  // '#85C1E9', // 하늘색
  // '#F8C471', // 주황색
];

// 일정 메시지 타입
export interface ScheduleMessage {
  type: 'today_single' | 'today_first' | 'today_last' | 'today_middle' | 'upcoming';
  title: string;
  subtitle?: string;
  description?: string; 
  color: string;
  daysLeft?: number;
}

// 캘린더 뷰 타입
export type CalendarView = 'week' | 'month';

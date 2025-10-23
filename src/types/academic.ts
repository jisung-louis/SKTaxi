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

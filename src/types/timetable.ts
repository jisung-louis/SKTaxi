export interface Course {
  id: string;
  grade: number;          // 학년 (1, 2, 3, 4)
  category: string;       // 이수구분 (전공선택, 교양필수, 교양선택 등)
  code: string;           // 과목코드 (01255)
  division: string;       // 분반 (001)
  name: string;           // 교과목명 (민법총칙)
  credits: number;        // 학점 (3)
  professor: string;      // 교수명 (문상혁)
  schedule: CourseSchedule[]; // 수업시간
  location: string;       // 강의실 (영401)
  note?: string;          // 비고
  semester: string;       // "2024-2"
  department?: string;    // 학과
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSchedule {
  dayOfWeek: number;      // 1=월, 2=화, 3=수, 4=목, 5=금
  startPeriod: number;     // 시작 교시 (1-15)
  endPeriod: number;       // 종료 교시 (1-15)
}

export interface UserTimetable {
  id: string;
  userId: string;
  semester: string;       // "2024-2"
  courses: string[];      // Course IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableCourse extends Course {
  color?: string;         // 수업 색상
  isSelected?: boolean;   // 편집 모드에서 선택 상태
  isPreview?: boolean;    // 미리보기 상태
}

// 시간표 블록 타입 (교시 단위)
export interface TimetableBlock {
  course: TimetableCourse;
  dayOfWeek: number;      // 1-5 (월-금)
  startPeriod: number;    // 시작 교시
  endPeriod: number;       // 종료 교시
  row: number;            // 렌더링 행 위치
}

// 시간표 뷰 모드
export type TimableViewMode = 'today' | 'week';

// 학기 정보
export interface Semester {
  id: string;
  name: string;           // "2024-2학기"
  year: number;           // 2024
  semester: number;       // 2
  startDate: string;      // "2024-09-01"
  endDate: string;        // "2024-12-31"
  isActive: boolean;
}

// 수업 검색 필터
export interface CourseSearchFilter {
  query?: string;
  semester?: string;
  department?: string;
  professor?: string;
  dayOfWeek?: number;
  timeSlot?: string;
  credits?: number;
}

// 시간표 공유 정보
export interface TimetableShare {
  id: string;
  timetableId: string;
  shareCode: string;
  isPublic: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

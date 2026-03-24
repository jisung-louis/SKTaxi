export type AcademicScheduleTypeDto = 'SINGLE' | 'MULTI';

export interface AcademicScheduleDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: AcademicScheduleTypeDto;
  isPrimary: boolean;
  description?: string | null;
}

export interface CafeteriaMenuDto {
  weekId: string;
  weekStart: string;
  weekEnd: string;
  menus: Record<string, Record<string, string[]>>;
}

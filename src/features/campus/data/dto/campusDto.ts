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

export type CampusBannerPaletteKeyDto =
  | 'GREEN'
  | 'BLUE'
  | 'PURPLE'
  | 'RED'
  | 'YELLOW';

export type CampusBannerActionTypeDto = 'IN_APP' | 'EXTERNAL_URL';

export type CampusBannerActionTargetDto =
  | 'TAXI_MAIN'
  | 'NOTICE_MAIN'
  | 'TIMETABLE_DETAIL'
  | 'CAFETERIA_DETAIL'
  | 'ACADEMIC_CALENDAR_DETAIL';

export interface CampusBannerResponseDto {
  id: string;
  badgeLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  buttonLabel: string;
  paletteKey: CampusBannerPaletteKeyDto;
  imageUrl: string;
  actionType: CampusBannerActionTypeDto;
  actionTarget?: CampusBannerActionTargetDto | null;
  actionParams?: Record<string, unknown> | null;
  actionUrl?: string | null;
}

import type {CampusStackParamList} from '@/app/navigation/types';

export interface CampusBannerPalette {
  backgroundGradient: readonly [string, string];
  badgeBackground: string;
  badgeText: string;
  buttonBackground: string;
  buttonText: string;
  accent: string;
}

export type CampusBannerPaletteKey =
  | 'GREEN'
  | 'BLUE'
  | 'PURPLE'
  | 'RED'
  | 'YELLOW';

export type CampusBannerInAppActionTarget =
  | 'TAXI_MAIN'
  | 'NOTICE_MAIN'
  | 'TIMETABLE_DETAIL'
  | 'CAFETERIA_DETAIL'
  | 'ACADEMIC_CALENDAR_DETAIL';

export type CampusBannerInAppAction =
  | {
      type: 'inApp';
      target: 'TAXI_MAIN';
    }
  | {
      type: 'inApp';
      target: 'NOTICE_MAIN';
    }
  | {
      type: 'inApp';
      target: 'TIMETABLE_DETAIL';
      params?: CampusStackParamList['TimetableDetail'];
    }
  | {
      type: 'inApp';
      target: 'CAFETERIA_DETAIL';
      params?: CampusStackParamList['CafeteriaDetail'];
    }
  | {
      type: 'inApp';
      target: 'ACADEMIC_CALENDAR_DETAIL';
      params?: CampusStackParamList['AcademicCalendarDetail'];
    };

export interface CampusBannerExternalUrlAction {
  type: 'externalUrl';
  url: string;
}

export type CampusBannerAction =
  | CampusBannerInAppAction
  | CampusBannerExternalUrlAction;

export interface CampusBannerSourceData {
  id: string;
  badgeLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  buttonLabel: string;
  paletteKey: CampusBannerPaletteKey;
  imageUrl: string;
  action: CampusBannerAction;
}

export interface CampusBannerViewData {
  id: string;
  badgeLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  buttonLabel: string;
  palette: CampusBannerPalette;
  imageUrl: string;
  action: CampusBannerAction;
}

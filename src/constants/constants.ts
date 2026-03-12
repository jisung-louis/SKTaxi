import {
  BOTTOMSHEET_HANDLE_HEIGHT,
  BOTTOM_TAB_BAR_HEIGHT,
  DAY_CELL_HEIGHT,
  PARTY_CARD_HEIGHT,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '@/shared/constants/layout';
import { DEPARTMENT_OPTIONS } from '@/shared/constants/departments';

export {
  BOTTOMSHEET_HANDLE_HEIGHT,
  BOTTOM_TAB_BAR_HEIGHT,
  DAY_CELL_HEIGHT,
  DEPARTMENT_OPTIONS,
  PARTY_CARD_HEIGHT,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
};

export const DEPARTURE_OPTIONS = [
    ['명학역', '안양역', '금정역'],
    ['범계역', '성결대학교'],
];

export const DESTINATION_OPTIONS = [
    ['성결대학교', '안양역', '금정역'],
    ['범계역', '명학역'],
];

export const DEPARTURE_LOCATION = [
    [{ latitude: 37.3846167, longitude: 126.935323965 }, { latitude: 37.4016640, longitude: 126.92271684 }, { latitude: 37.371838475, longitude: 126.943650313 }],
    [{ latitude: 37.3896500, longitude: 126.9506139 }, { latitude: 37.38131, longitude: 126.9288 }],
];

export const DESTINATION_LOCATION = [
    [{ latitude: 37.38131, longitude: 126.9288 }, { latitude: 37.4016640, longitude: 126.92271684 }, { latitude: 37.371838475, longitude: 126.943650313 }],
    [{ latitude: 37.3896500, longitude: 126.9506139 }, { latitude: 37.3846167, longitude: 126.935323965 }],
];

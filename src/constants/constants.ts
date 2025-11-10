import { Platform } from 'react-native';
export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'android' ? 80 : 90; // 바텀네비게이션 탭바 높이
export const BOTTOMSHEET_HANDLE_HEIGHT = 24; // 바텀시트 핸들 높이
export const PARTY_CARD_HEIGHT = 120; // 택시 파티 카드 높이
export const DAY_CELL_HEIGHT = 36;

export const DEPARTURE_OPTIONS = [
    ['명학역', '안양역', '금정역'],
    ['범계역', '성결대학교'],
];

export const DESTINATION_OPTIONS = [
    ['성결대학교', '안양역', '금정역'],
    ['범계역', '명학역'],
];

export const DEPARTURE_LOCATION = [
    [{latitude: 37.3846167, longitude: 126.935323965}, {latitude: 37.4016640, longitude: 126.92271684}, {latitude: 37.371838475, longitude: 126.943650313}],
    [{latitude: 37.3896500, longitude: 126.9506139}, {latitude: 37.38131, longitude: 126.9288}],
];

export const DESTINATION_LOCATION = [
    [{latitude: 37.38131, longitude: 126.9288}, {latitude: 37.4016640, longitude: 126.92271684}, {latitude: 37.371838475, longitude: 126.943650313}],
    [{latitude: 37.3896500, longitude: 126.9506139}, {latitude: 37.3846167, longitude: 126.935323965}],
];

export const DEPARTMENT_OPTIONS: string[] = [
    '신학과',
    '기독교교육상담학과',
    '문화선교학과',
    '영어영문학과',
    '중어중문학과',
    '국어국문학과',
    '사회복지학과',
    '국제개발협력학과',
    '행정학과',
    '관광학과',
    '경영학과',
    '글로벌물류학과',
    '산업경영공학과',
    '유아교육과',
    '체육교육과',
    '교직부',
    '컴퓨터공학과',
    '정보통신공학과',
    '미디어소프트웨어학과',
    '도시디자인정보공학과',
    '음악학부',
    '실용음악과',
    '공연음악예술학부',
    '연기예술학과',
    '영화영상학과',
    '연극영화학부',
    '뷰티디자인학과',
    '융합학부',
    '파이데이아학부',
];
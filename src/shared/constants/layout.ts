import { Dimensions, Platform } from 'react-native';

export const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'android' ? 80 : 90;
export const BOTTOMSHEET_HANDLE_HEIGHT = 24;
export const PARTY_CARD_HEIGHT = 120;
export const DAY_CELL_HEIGHT = 36;

import { useMemo, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheet, { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { BOTTOMSHEET_HANDLE_HEIGHT, BOTTOM_TAB_BAR_HEIGHT } from '../../../../constants/constants';

export const useTaxiBottomSheet = () => {
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedPosition = useSharedValue(0);
  const animatedIndex = useSharedValue(0);

  //const DEFAULT_SNAP_POINTS = WINDOW_WIDTH + BOTTOM_TAB_BAR_HEIGHT;
  //const DEFAULT_SNAP_POINTS = WINDOW_HEIGHT - WINDOW_WIDTH + BOTTOMSHEET_HANDLE_HEIGHT;
  console.log('WINDOW_WIDTH', WINDOW_WIDTH);
  console.log('( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT ) / 2 + BOTTOMSHEET_HANDLE_HEIGHT', (( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT ) / 2) + BOTTOMSHEET_HANDLE_HEIGHT);
  const DEFAULT_SNAP_POINTS = 
    ( Math.min(WINDOW_WIDTH, ( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT) / 2) === WINDOW_WIDTH ) 
    ? WINDOW_HEIGHT - WINDOW_WIDTH + BOTTOMSHEET_HANDLE_HEIGHT 
    : (( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT ) / 2) + BOTTOMSHEET_HANDLE_HEIGHT + BOTTOM_TAB_BAR_HEIGHT;
  const FULL_SNAP_POINT = WINDOW_HEIGHT
  const snapPoints = useMemo(
    () => [DEFAULT_SNAP_POINTS, FULL_SNAP_POINT],
    [DEFAULT_SNAP_POINTS, FULL_SNAP_POINT]
  );

  const handleChange = (index: number) => {
    setBottomSheetIndex(index);
  };

  const toggleBottomSheet = () => {
    if (bottomSheetIndex === 0) {
      // 현재 기본 상태 -> 전체 화면으로
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      // 현재 전체 화면 -> 기본 상태로
      bottomSheetRef.current?.snapToIndex(0);
    }
  };

  return { 
    bottomSheetRef, 
    bottomSheetIndex, 
    snapPoints, 
    handleChange, 
    toggleBottomSheet,
    animatedPosition,
    animatedIndex,
    DEFAULT_SNAP_POINTS,
    FULL_SNAP_POINT,
  } as const;
};

import { useMemo, useRef, useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { Dimensions } from 'react-native';
import { BOTTOM_TAB_BAR_HEIGHT } from '../../../../constants/constants';

export const useTaxiBottomSheet = () => {
  const { width, height } = Dimensions.get('window');
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height - width - BOTTOM_TAB_BAR_HEIGHT, '80%'], [height, width]);

  const handleChange = (index: number) => {
    // if (index > 1) {
    //   bottomSheetRef.current?.snapToIndex(1);
    // } else {
    //   setBottomSheetIndex(index);
    // }
  };

  return { bottomSheetRef, bottomSheetIndex, snapPoints, handleChange } as const;
};



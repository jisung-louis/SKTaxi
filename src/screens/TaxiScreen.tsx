import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import MapView from 'react-native-maps';
import BottomSheet, {BottomSheetView, WINDOW_WIDTH, WINDOW_HEIGHT} from '@gorhom/bottom-sheet';
import { PartyList } from '../components/section/TaxiTab/PartyList';
import { dummyParties } from '../constants/mock_data/dummyParties'
import { useCurrentLocation } from '../components/section/TaxiTab/hooks/useCurrentLocation';
import { useTaxiBottomSheet } from '../components/section/TaxiTab/hooks/useTaxiBottomSheet';
import { usePartySelection } from '../components/section/TaxiTab/hooks/usePartySelection';
import { BOTTOMSHEET_HANDLE_HEIGHT, BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import Animated, { useAnimatedStyle, interpolate, useAnimatedReaction, useSharedValue, runOnJS, Extrapolation } from 'react-native-reanimated';

export const TaxiScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const { location, loading } = useCurrentLocation();
  const { bottomSheetRef, bottomSheetIndex, snapPoints, handleChange, toggleBottomSheet, animatedPosition, animatedIndex, DEFAULT_SNAP_POINTS, FULL_SNAP_POINT} = useTaxiBottomSheet();
  const { selectedPartyId, handleCardPress } = usePartySelection(mapRef, location);
  const HANDLE_WIDTH = 48;

  const animatedHandleIndicatorStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animatedIndex.value,
      [0, 1],
      [HANDLE_WIDTH, 0],
      Extrapolation.CLAMP
    );
    return { width };
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 16 }}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : location ? (
        <MapView
          ref={mapRef}
          style={{ width: WINDOW_WIDTH, height: WINDOW_WIDTH + BOTTOMSHEET_HANDLE_HEIGHT}}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.text.secondary }}>위치 정보를 가져올 수 없습니다.</Text>
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: COLORS.background.primary}}
        handleIndicatorStyle={[{ backgroundColor: COLORS.accent.green }, animatedHandleIndicatorStyle]}
        onChange={handleChange}
        animatedPosition={animatedPosition}
        animatedIndex={animatedIndex}
        // enableDynamicSizing={false}
      >
        <BottomSheetView>
          <PartyList
            parties={dummyParties}
            selectedPartyId={selectedPartyId}
            bottomSheetIndex={bottomSheetIndex}
            animatedPosition={animatedPosition}
            onPressParty={(party) => handleCardPress(party)}
            onToggleBottomSheet={toggleBottomSheet}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  // Card 관련 스타일은 PartyList로 이동됨
});
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaxiStackParamList } from '../navigations/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import Animated, { useAnimatedStyle, interpolate, useAnimatedReaction, useSharedValue, runOnJS, Extrapolation, withTiming } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import Button from '../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';

type TaxiScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'TaxiMain'>;

export const TaxiScreen = () => {
  const navigation = useNavigation<TaxiScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);
  const { location, loading } = useCurrentLocation();
  const { bottomSheetRef, bottomSheetIndex, snapPoints, handleChange, toggleBottomSheet, animatedPosition, animatedIndex,} = useTaxiBottomSheet();
  const { selectedPartyId, handleCardPress } = usePartySelection(mapRef, location);
  const HANDLE_WIDTH = 48;
  const isFocused = useIsFocused();
  const screenTranslateY = useSharedValue(0);
  const mapOpacity = useSharedValue(0);

  useEffect(() => {
    // 화면 전환 시 흰색 플래시 방지를 위해 opacity는 고정, 위치만 살짝 슬라이드
    screenTranslateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: COLORS.background.primary,
    transform: [{ translateY: screenTranslateY.value }],
  }));

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
  }));

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
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 16 }}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : location ? (
        <Animated.View style={mapAnimatedStyle}>
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
            onMapReady={() => { mapOpacity.value = withTiming(1, { duration: 200 }); }}
          />
        </Animated.View>
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
        enableDynamicSizing={false}
      >
        <BottomSheetView>
          <PartyList
            parties={dummyParties}
            selectedPartyId={selectedPartyId}
            bottomSheetIndex={bottomSheetIndex}
            animatedPosition={animatedPosition}
            onPressParty={(party) => handleCardPress(party)}
            onToggleBottomSheet={toggleBottomSheet}
            onRequestJoinParty={(party) => {
              console.log('onRequestJoinParty', JSON.stringify(party, null, 2));
              navigation.navigate('AcceptancePending', { party });
            }}
          />
        </BottomSheetView>
      </BottomSheet>
      <TouchableOpacity style={styles.floatingButtonContainer} onPress={() => navigation.navigate('Recruit')}>
        <Icon name="add-outline" size={48} color={COLORS.background.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  // Card 관련 스타일은 PartyList로 이동됨
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 16 + BOTTOM_TAB_BAR_HEIGHT,
    right: 16,
    zIndex: 10000,
    backgroundColor: COLORS.accent.green,
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent.green,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
});
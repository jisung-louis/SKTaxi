// SKTaxi: TaxiScreen - SRP 리팩토링 완료
// 
// 리팩토링 내용:
// 1. UI 컴포넌트 분리 (TaxiPermissionPrompt, TaxiTimeRemaining)
// 2. 비즈니스 로직은 hooks/useTaxiScreenPresenter 로 위임
// 3. UI 상태 관리와 레이아웃에 집중

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetView, WINDOW_WIDTH, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useScreenView } from '../hooks/useScreenView';
import { TabBadge } from '../components/common/TabBadge';
import { PartyList } from './TaxiTab/components/PartyList';

import { useTaxiScreenPresenter } from './TaxiTab/hooks/useTaxiScreenPresenter';
import { TaxiPermissionPrompt, TaxiTimeRemaining } from './TaxiTab/components';

const HANDLE_WIDTH = 48;

export const TaxiScreen = () => {
  useScreenView();

  const {
    mapRef,
    location,
    loading,
    isLocationValid,
    parties,
    selectedPartyId,
    bottomSheetRef,
    snapPoints,
    bottomSheetIndex,
    animatedPosition,
    animatedIndex,
    handleChange,
    toggleBottomSheet,
    handleCardPress,
    handleLocationPermissionRequest,
    handleMapReady,
    navigateToChat,
    navigateToRecruit,
    hasParty,
    partyId,
    myPartyLoading,
    joinRequestCount,
    timeRemaining,
    insets,
    screenTranslateY,
    mapOpacity,
    opacity,
    timeRemainingAnimatedStyle,
  } = useTaxiScreenPresenter();

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={styles.loadingText}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : isLocationValid ? (
        <Animated.View style={mapAnimatedStyle}>
          <MapView
            ref={mapRef}
            style={{ width: WINDOW_WIDTH, height: Math.min(WINDOW_WIDTH, (WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT) / 2), backgroundColor: COLORS.background.primary }}
            initialRegion={{
              latitude: location!.latitude,
              longitude: location!.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={isLocationValid}
            onMapReady={handleMapReady}
          />
        </Animated.View>
      ) : (
        <TaxiPermissionPrompt onRequestPermission={handleLocationPermissionRequest} />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: COLORS.background.primary }}
        handleIndicatorStyle={[{ backgroundColor: COLORS.accent.green }, animatedHandleIndicatorStyle]}
        onChange={handleChange}
        animatedPosition={animatedPosition}
        animatedIndex={animatedIndex}
        enableDynamicSizing={false}
      >
        <BottomSheetView>
          <View style={{ opacity: isLocationValid ? 1 : 0.5 }} pointerEvents={isLocationValid ? 'auto' : 'none'}>
            <PartyList
              parties={parties}
              selectedPartyId={selectedPartyId}
              bottomSheetIndex={bottomSheetIndex}
              animatedPosition={animatedPosition}
              onPressParty={(party) => handleCardPress(party as any)}
              onToggleBottomSheet={toggleBottomSheet}
              onRequestJoinParty={(party) => {
                console.log('onRequestJoinParty', JSON.stringify(party, null, 2));
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>

      {(!myPartyLoading && hasParty && partyId) ? (
        <TouchableOpacity
          style={[styles.floatingButtonContainer, { width: 'auto', paddingHorizontal: 16 }]}
          onPress={navigateToChat}
        >
          <View style={{ position: 'relative' }}>
            <Text style={styles.floatingButtonText}>내 파티 채팅방</Text>
            <TabBadge count={joinRequestCount} size="large" style={{ position: 'absolute', top: -20, right: -8 }} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.floatingButtonContainer, { opacity: isLocationValid ? 1 : 0.5 }]}
          disabled={!isLocationValid}
          onPress={navigateToRecruit}
        >
          <Icon name="add-outline" size={48} color={COLORS.background.primary} />
        </TouchableOpacity>
      )}

      {(!myPartyLoading && hasParty && partyId) && (
        <TaxiTimeRemaining
          timeText={timeRemaining}
          style={timeRemainingAnimatedStyle}
          topInset={insets.top}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    marginTop: 16,
  },
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
  floatingButtonText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.title3,
    textAlign: 'center',
  },
});
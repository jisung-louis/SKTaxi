import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaxiStackParamList } from '../navigations/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet, {BottomSheetView, WINDOW_WIDTH, WINDOW_HEIGHT} from '@gorhom/bottom-sheet';
import { PartyList } from '../components/section/TaxiTab/PartyList';
import { useParties } from '../hooks/useParties'; // SKTaxi: Firestore parties 구독 훅 사용
import { useCurrentLocation } from '../components/section/TaxiTab/hooks/useCurrentLocation';
import { useTaxiBottomSheet } from '../components/section/TaxiTab/hooks/useTaxiBottomSheet';
import { usePartySelection } from '../components/section/TaxiTab/hooks/usePartySelection';
import { BOTTOMSHEET_HANDLE_HEIGHT, BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import Animated, { useAnimatedStyle, interpolate, useAnimatedReaction, useSharedValue, runOnJS, Extrapolation, withTiming } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import Button from '../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMyParty } from '../hooks/useMyParty'; // SKTaxi: 사용자 소속 파티 감지 훅
import { useJoinRequestCount } from '../contexts/JoinRequestContext';
import { TabBadge } from '../components/common/TabBadge';
import { usePartyMemberLocations } from '../hooks/usePartyMemberLocations';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TaxiScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'TaxiMain'>;

export const TaxiScreen = () => {
  const navigation = useNavigation<TaxiScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);
  const { location, loading } = useCurrentLocation();
  const { parties } = useParties(); // SKTaxi: 실시간 파티 목록 사용
  const { hasParty, partyId, loading: myPartyLoading } = useMyParty(); // SKTaxi: 소속 파티 여부로 CTA 분기
  const { joinRequestCount } = useJoinRequestCount(); // SKTaxi: 동승 요청 개수
  const { memberLocations } = usePartyMemberLocations(partyId); // SKTaxi: 파티원 위치 정보
  const { bottomSheetRef, bottomSheetIndex, snapPoints, handleChange, toggleBottomSheet, animatedPosition, animatedIndex, DEFAULT_SNAP_POINTS, FULL_SNAP_POINT} = useTaxiBottomSheet();
  const { selectedPartyId, handleCardPress } = usePartySelection(mapRef, location);
  const HANDLE_WIDTH = 48;
  const isFocused = useIsFocused();
  const screenTranslateY = useSharedValue(0);
  const mapOpacity = useSharedValue(0);
  const opacity = useSharedValue(1);
  const insets = useSafeAreaInsets();
  
  // SKTaxi: 남은 시간 계산을 위한 상태
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // SKTaxi: 남은 시간 계산 함수
  const calculateTimeRemaining = (departureTime: string) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure.getTime() - now.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffMs <= 0) {
      return `출발 시간이 ${-diffMinutes}분 지났어요`;
    }
    
    if (diffHours > 0) {
      return `출발 시간이 ${diffHours}시간 ${remainingMinutes}분 남았어요`;
    } else {
      return `출발 시간이 ${diffMinutes}분 남았어요`;
    }
  };

  // SKTaxi: 내 파티의 출발 시간으로 남은 시간 계산
  useEffect(() => {
    if (hasParty && partyId) {
      const myParty = parties.find(p => p.id === partyId);
      if (myParty?.departureTime) {
        setTimeRemaining(calculateTimeRemaining(myParty.departureTime));
        
        // SKTaxi: 1분마다 시간 업데이트
        const interval = setInterval(() => {
          setTimeRemaining(calculateTimeRemaining(myParty.departureTime));
        }, 60000); // 1분 = 60000ms
        
        return () => clearInterval(interval);
      }
    } else {
      setTimeRemaining('');
    }
  }, [hasParty, partyId, parties]);

  useEffect(() => {
    //opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    screenTranslateY.value = withTiming(isFocused ? 0 : 0, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: COLORS.background.primary,
    transform: [{ translateY: screenTranslateY.value }],
  }));

  // SKTaxi: 시간 표시 뷰 애니메이션 스타일
  const timeRemainingAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [DEFAULT_SNAP_POINTS * 0.7, 0], // bottomSheet가 70% 올라오면 완전히 사라짐
      [1, 0],
      Extrapolation.CLAMP
    );
    
    const scale = interpolate(
      animatedPosition.value,
      [DEFAULT_SNAP_POINTS * 0.7, 0],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    
    const translateY = interpolate(
      animatedPosition.value,
      [DEFAULT_SNAP_POINTS * 0.7, 0],
      [0, -20],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        { scale },
        { translateY }
      ],
    };
  });

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

  const isLocationValid = !!(
    location &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
  );

  // SKTaxi: 위치 추적
  useLocationTracking(location, isLocationValid);

  // SKTaxi: 파티원 위치가 변경될 때마다 지도 줌 조정
  useEffect(() => {
    if (memberLocations.length > 0 && mapRef.current) {
      const coordinates = memberLocations.map(member => ({
        latitude: member.latitude,
        longitude: member.longitude,
      }));

      // 현재 사용자 위치도 포함
      if (isLocationValid && location) {
        coordinates.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      // 모든 좌표를 포함하는 영역 계산
      const latitudes = coordinates.map(coord => coord.latitude);
      const longitudes = coordinates.map(coord => coord.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const latDelta = maxLat - minLat;
      const lngDelta = maxLng - minLng;

      // 최소 델타 값 설정 (너무 가까우면 확대)
      const minDelta = 0.01;
      const finalLatDelta = Math.max(latDelta, minDelta);
      const finalLngDelta = Math.max(lngDelta, minDelta);

      // 여백을 위해 20% 추가
      const padding = 0.2;
      const paddedLatDelta = finalLatDelta * (1 + padding);
      const paddedLngDelta = finalLngDelta * (1 + padding);

      const region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: paddedLatDelta,
        longitudeDelta: paddedLngDelta,
      };

      mapRef.current.animateToRegion(region, 1000);
    }
  }, [memberLocations, isLocationValid, location]);

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 16 }}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : isLocationValid ? (
        <Animated.View style={mapAnimatedStyle}>
          <MapView
            ref={mapRef}
            style={{ width: WINDOW_WIDTH, height: WINDOW_WIDTH + BOTTOMSHEET_HANDLE_HEIGHT, backgroundColor: COLORS.background.primary}}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={isLocationValid}
            onMapReady={() => { mapOpacity.value = withTiming(1, { duration: 200 }); }}
          >
            {/* SKTaxi: 파티원 위치 마커들 */}
            {memberLocations.map((memberLocation, index) => (
              <Marker
                key={memberLocation.userId}
                coordinate={{
                  latitude: memberLocation.latitude,
                  longitude: memberLocation.longitude,
                }}
                title={memberLocation.displayName}
                description={`${Math.round((new Date().getTime() - memberLocation.lastUpdated.getTime()) / 1000 / 60)}분 전`}
              >
                <View style={styles.memberMarker}>
                  <Text style={styles.memberMarkerText}>
                    {memberLocation.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>
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
            parties={parties}
            selectedPartyId={selectedPartyId}
            bottomSheetIndex={bottomSheetIndex}
            animatedPosition={animatedPosition}
            onPressParty={(party) => handleCardPress(party as any)} // SKTaxi: Firestore 스키마와 훅 시그니처 호환을 위한 캐스팅
            onToggleBottomSheet={toggleBottomSheet}
            onRequestJoinParty={(party) => {
              console.log('onRequestJoinParty', JSON.stringify(party, null, 2));
              // SKTaxi: requestId는 PartyList에서 생성 후 전달하므로 여기서는 이동하지 않음
            }}
          />
        </BottomSheetView>
      </BottomSheet>
      {(!myPartyLoading && hasParty && partyId) ? (
        <TouchableOpacity style={[styles.floatingButtonContainer, { width: 'auto', paddingHorizontal: 16 }]} onPress={() => navigation.navigate('Chat', { partyId })}>
          <View style={{ position: 'relative' }}>
            <Text style={styles.floatingButtonText}>내 파티 채팅방</Text>
            <TabBadge count={joinRequestCount} style={{ position: 'absolute', top: -16, right: -8 }} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.floatingButtonContainer} onPress={() => navigation.navigate('Recruit')}>
          <Icon name="add-outline" size={48} color={COLORS.background.primary} />
        </TouchableOpacity>
      )}
      {(!myPartyLoading && hasParty && partyId) && (
        <Animated.View style={[
          styles.floatingContentContainer, 
          { top: insets.top },
          timeRemainingAnimatedStyle
        ]}>
          <Text style={styles.floatingContentText}>{timeRemaining}</Text>
        </Animated.View>
      )}
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
  floatingButtonText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.title3,
    textAlign: 'center',
  },
  floatingContentContainer: {
    position: 'absolute',
    left: 48,
    right: 48,
    zIndex: 100000,
    backgroundColor: COLORS.background.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: COLORS.background.primary,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingContentText: {
    color: COLORS.text.primary,
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    textAlign: 'center',
  },
  // SKTaxi: 파티원 마커 스타일
  memberMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memberMarkerText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    fontSize: 16,
  },
});
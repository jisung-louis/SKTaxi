import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking, Platform, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaxiStackParamList } from '../navigations/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet, {BottomSheetView, WINDOW_WIDTH, WINDOW_HEIGHT} from '@gorhom/bottom-sheet';
import { PartyList } from '../components/section/TaxiTab/PartyList';
import { useParties } from '../hooks/useParties'; // SKTaxi: Firestore parties 구독 훅 사용
import { useCurrentLocation } from '../components/section/TaxiTab/hooks/useCurrentLocation';
import { requestLocationPermission } from '../components/section/TaxiTab/hooks/useCurrentLocation';
import { useTaxiBottomSheet } from '../components/section/TaxiTab/hooks/useTaxiBottomSheet';
import { usePartySelection } from '../components/section/TaxiTab/hooks/usePartySelection';
import { BOTTOMSHEET_HANDLE_HEIGHT, BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import Animated, { useAnimatedStyle, interpolate, useSharedValue, Extrapolation, withTiming } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
// import Button from '../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import { useMyParty } from '../hooks/useMyParty'; // SKTaxi: 사용자 소속 파티 감지 훅
import { useJoinRequestCount } from '../contexts/JoinRequestContext';
import { TabBadge } from '../components/common/TabBadge';
import { usePartyMemberLocations } from '../hooks/usePartyMemberLocations';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';

type TaxiScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'TaxiMain'>;

export const TaxiScreen = () => {
  const navigation = useNavigation<TaxiScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);
  const { location, loading, refresh } = useCurrentLocation();
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
  const [shareMyLocation, setShareMyLocation] = useState<boolean>(true);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const currentUserId = auth(getApp()).currentUser?.uid;
  const amLeader = useMemo(() => {
    const myParty = hasParty && partyId ? parties.find(p => p.id === partyId) : undefined;
    return !!(currentUserId && myParty?.leaderId === currentUserId);
  }, [hasParty, partyId, parties, currentUserId]);
  
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
    const opacityValue = interpolate(
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
      opacity: opacityValue,
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

  // SKTaxi: 위치 추적 (위치 공유 토글 반영)
  useLocationTracking(location, isLocationValid, shareMyLocation);

  // SKTaxi: 포그라운드 복귀 시 위치 권한/상태 재확인
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh && refresh();
      }
    });
    return () => sub.remove();
  }, [refresh]);

  // SKTaxi: 설정 앱으로 이동
  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('오류', '설정 앱을 열 수 없습니다.');
    }
  };

  // SKTaxi: 위치 권한 재요청 및 설정 안내
  const handleLocationPermissionRequest = async () => {
    // 먼저 권한 재요청 시도
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      // 권한이 거절되면 설정으로 이동 안내
      if(Platform.OS === 'android') {
        Alert.alert(
          '위치 권한이 필요해요',
          '위치 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: openAppSettings }
          ]
        );
      } else if(Platform.OS === 'ios') {
        Alert.alert(
          '위치 권한이 필요해요',
          '위치 → \'앱을 사용하는 동안\'으로 설정해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: openAppSettings }
          ]
        );
      }
    }
  };

  // SKTaxi: 파티원 위치가 변경될 때마다 지도 줌 조정
  useEffect(() => {
    if (mapRef.current) {
      const visibleMembers = memberLocations.filter(m => (m.latitude || 0) !== 0 && (m.longitude || 0) !== 0 && m.share !== false);
      if (visibleMembers.length === 0 && !isLocationValid) return;
      const coordinates = visibleMembers.map(member => ({
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
      const minDelta = 0.001;
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

  // SKTaxi: 특정 파티원으로 포커스 이동
  const focusToMember = (userId: string) => {
    const member = memberLocations.find(m => m.userId === userId);
    if (member && mapRef.current) {
      setFocusedMemberId(userId);
      mapRef.current.animateToRegion({
        latitude: member.latitude,
        longitude: member.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  // SKTaxi: 리스트 정렬 - 리더 → 나 → 나머지(가나다)
  const sortedMembers = useMemo(() => {
    const myParty = hasParty && partyId ? parties.find(p => p.id === partyId) : undefined;
    const leaderId = myParty?.leaderId;
    const collator = new Intl.Collator('ko');
    // shallow compare, 만약 이전과 동일하면 반환
    // (실제 setMemberLocations는 usePartyMemberLocations에서), 여기서는 배열 content 기준만 신경
    if (!memberLocations || memberLocations.length === 0) return [];
    return [...memberLocations].sort((a, b) => {
      const isALeader = a.userId === leaderId ? 0 : 1;
      const isBLeader = b.userId === leaderId ? 0 : 1;
      if (isALeader !== isBLeader) return isALeader - isBLeader;
      const isAMe = a.userId === currentUserId ? 0 : 1;
      const isBMe = b.userId === currentUserId ? 0 : 1;
      if (isAMe !== isBMe) return isAMe - isBMe;
      return collator.compare(a.displayName || '', b.displayName || '');
    });
  }, [JSON.stringify(memberLocations), parties, hasParty, partyId]);
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
            style={{ width: WINDOW_WIDTH, height: Math.min(WINDOW_WIDTH, ( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT) / 2), backgroundColor: COLORS.background.primary}}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={isLocationValid}
            tintColor={COLORS.accent.green}
            onMapReady={() => { mapOpacity.value = withTiming(1, { duration: 200 }); }}
          >
            {/* SKTaxi: 파티원 위치 마커들 (내 마커 제외, 숨김/무효 좌표 제외) */}
            {memberLocations
              .filter(m => m.userId !== currentUserId)
              .filter(m => (m.latitude || 0) !== 0 && (m.longitude || 0) !== 0 && m.share !== false)
              .map((memberLocation, index) => {
                const myParty = hasParty && partyId ? parties.find(p => p.id === partyId) : undefined;
                const isLeader = memberLocation.userId === myParty?.leaderId;
                return (
              <Marker
                key={memberLocation.userId}
                coordinate={{
                  latitude: memberLocation.latitude,
                  longitude: memberLocation.longitude,
                }}
                title={memberLocation.displayName}
                description={`${Math.round((new Date().getTime() - memberLocation.lastUpdated.getTime()) / 1000 / 60)}분 전`}
              >
                <View style={{ position: 'relative', alignItems: 'center' }}>
                  {isLeader && (
                    <FA5 name="crown" size={12} color={COLORS.accent.orange} style={{ position: 'absolute', top: -10, zIndex: 2 }} />
                  )}
                  <View style={styles.memberMarker}>
                    <Text style={styles.memberMarkerText}>
                      {memberLocation.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Marker>
            );
            })}
          </MapView>
          {(hasParty && partyId) && (
            <>
              <View style={styles.partyMemberList}>
                {sortedMembers.map((memberLocation) => {
                  const selected = focusedMemberId === memberLocation.userId;
                  const isMe = memberLocation.userId === currentUserId;
                  const myParty = hasParty && partyId ? parties.find(p => p.id === partyId) : undefined;
                  const isLeader = memberLocation.userId === myParty?.leaderId;
                  const isHidden = memberLocation.share === false;
                  const disabled = isHidden && !isMe; // 본인 숨김이어도 본인 UI는 비활성화하지 않음
                  return (
                    <TouchableOpacity
                      key={memberLocation.userId}
                      style={[
                        styles.partyMemberItem,
                        selected && { opacity: 1 },
                        disabled && { opacity: 0.5 },
                      ]}
                      onPress={() => !disabled && focusToMember(memberLocation.userId)}
                      accessibilityLabel={`${memberLocation.displayName} 위치로 이동`}
                      disabled={disabled}
                    >
                      <View style={{ alignItems: 'center', }}>
                        {isLeader && (
                          <FA5 name="crown" size={12} color={COLORS.accent.orange} />
                        )}
                        <View style={[
                          styles.memberMarker,
                          { 
                            backgroundColor: isMe ? COLORS.accent.green : COLORS.accent.blue }
                        ] }>
                          <Text style={[styles.memberMarkerText]}>
                            {memberLocation.displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.partyMemberItemText,
                        { marginLeft: 4,
                          fontWeight: isMe ? '700' : '400',
                          textDecorationLine: disabled ? 'line-through' : 'none'
                        }, selected && { textDecorationLine: 'underline' }
                      ]}>
                        {memberLocation.displayName}{isMe && ' (나)'}
                      </Text>
                      {isHidden && (
                        <Icon name="eye-off-outline" size={14} color={COLORS.text.secondary} style={{ paddingVertical: 6, marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity 
                style={styles.hideMyLocationCheckboxContainer}
                onPress={() => {
                  if (amLeader) {
                    Alert.alert('안내', '리더는 위치를 숨길 수 없어요');
                    return;
                  }
                  setShareMyLocation(prev => !prev);
                }}
                accessibilityLabel={shareMyLocation ? '내 위치 숨기기' : '내 위치 보이기'}
              >
                <Icon name={shareMyLocation ? 'eye-off-outline' : 'eye-outline'} size={14} color={shareMyLocation ? COLORS.text.tertiary : COLORS.text.secondary} />
                <Text style={[styles.hideMyLocationCheckboxText, { color: shareMyLocation ? COLORS.text.tertiary : COLORS.text.secondary }]}>{shareMyLocation ? '내 위치 숨기기' : '내 위치 보이기'}</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      ) : (
        <SafeAreaView style={{ height: WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT - WINDOW_WIDTH, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background.tertiary }}>
          <Icon name="location-outline" size={64} color={COLORS.text.secondary} />
          <Text style={{ color: COLORS.text.primary, ...TYPOGRAPHY.title3, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>
            위치 권한이 필요해요
          </Text>
          <Text style={{ color: COLORS.text.secondary, ...TYPOGRAPHY.body2, lineHeight: 20, marginTop: 8, textAlign: 'center'}}>
            택시 동승을 위해 현재 위치가 필요합니다.{'\n'}
            설정에서 위치 권한을 허용해주세요.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: COLORS.accent.green, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 16 }}
            onPress={handleLocationPermissionRequest}
          >
            <Text style={{ color: COLORS.background.primary, ...TYPOGRAPHY.body2, fontWeight: '600' }}>권한 허용하기</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
          <View style={{ opacity: isLocationValid ? 1 : 0.5 }} pointerEvents={isLocationValid ? 'auto' : 'none'}>
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
          </View>
        </BottomSheetView>
      </BottomSheet>
      {(!myPartyLoading && hasParty && partyId) ? (
        <TouchableOpacity style={[styles.floatingButtonContainer, { width: 'auto', paddingHorizontal: 16 }]} onPress={() => navigation.navigate('Chat', { partyId })}>
          <View style={{ position: 'relative' }}>
            <Text style={styles.floatingButtonText}>내 파티 채팅방</Text>
            <TabBadge count={joinRequestCount} size="large" style={{ position: 'absolute', top: -20, right: -8 }} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.floatingButtonContainer, { opacity: isLocationValid ? 1 : 0.5 }]} disabled={!isLocationValid} onPress={() => navigation.navigate('Recruit')}>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 5,
  },
  memberMarkerText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
  },
  partyMemberList: {
    position: 'absolute',
    bottom: BOTTOMSHEET_HANDLE_HEIGHT + 8,
    left: 8,
    zIndex: 10,
    padding: 10,
    gap: 2,
    backgroundColor:COLORS.background.tertiary,
    borderRadius: 12,
  },
  partyMemberItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  partyMemberItemText: {
    color: COLORS.text.primary,
    ...TYPOGRAPHY.body2,
    paddingVertical: 5,
  },
  hideMyLocationCheckboxContainer: {
    position: 'absolute',
    bottom: BOTTOMSHEET_HANDLE_HEIGHT + 8,
    right: 8,
    zIndex: 10,
    padding: 10,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:COLORS.background.tertiary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hideMyLocationCheckboxText: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.caption2,
  },
});
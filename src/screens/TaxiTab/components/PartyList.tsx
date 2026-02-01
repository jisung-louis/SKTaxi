import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { BOTTOMSHEET_HANDLE_HEIGHT, PARTY_CARD_HEIGHT } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedReanimated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { BOTTOM_TAB_BAR_HEIGHT } from '../../../constants/constants';
import { Party } from '../../../types/party';
import Button from '../../../components/common/Button';
import { useUserDisplayNames } from '../../../hooks/user';
import { formatKoreanAmPmTime } from '../../../utils/datetime';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaxiStackParamList } from '../../../navigations/types';
import { useMyParty, usePendingJoinRequest, useJoinRequest } from '../../../hooks/party';
import { useCurrentLocation } from '../../../hooks/common/useCurrentLocation';
import { logEvent } from '../../../lib/analytics';
import { useAuth } from '../../../hooks/auth';


interface PartyListProps {
  parties: Party[];
  selectedPartyId: string | null;
  bottomSheetIndex: number;
  onPressParty: (party: Party, index: number) => void;
  onRequestJoinParty: (party: Party) => void;
  onToggleBottomSheet: () => void;
  animatedPosition: AnimatedReanimated.SharedValue<number>;
}

export const PartyList: React.FC<PartyListProps> = ({
  parties,
  selectedPartyId,
  bottomSheetIndex,
  onPressParty,
  onRequestJoinParty,
  onToggleBottomSheet,
  animatedPosition,
}) => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('최신순');
  const navigation = useNavigation<NativeStackNavigationProp<TaxiStackParamList>>();

  // SKTaxi: 리더 uid들을 수집해 displayName 매핑
  const leaderUids = parties.map((p) => p.leaderId).filter(Boolean) as string[];
  const { displayNameMap } = useUserDisplayNames(leaderUids);

  // SKTaxi: 사용자 파티 소속 여부 확인
  const { hasParty, partyId: myPartyId } = useMyParty();

  // SKTaxi: 현재 사용자의 pending 동승 요청 조회
  const { pendingRequest } = usePendingJoinRequest();

  // SKTaxi: 동승 요청 액션 (Repository 패턴)
  const { createJoinRequest, cancelJoinRequest } = useJoinRequest();
  const { user } = useAuth();

  // SKTaxi: 현재 위치
  const { location } = useCurrentLocation();
  const isLocationAvailable = !!location;

  const sortOptions = [
    { label: '최신순', value: 'latest' },
    { label: '가까운순', value: 'distance' },
  ];

  const handleSortSelect = (option: { label: string; value: string }) => {
    // 안전장치: 위치가 유효하지 않은데 '가까운순' 선택 시 조용히 최신순으로 복귀
    if (option.label === '가까운순' && (!isLocationAvailable)) {
      setSelectedSort('최신순');
      setIsDropdownOpen(false);
      return;
    }
    setSelectedSort(option.label);
    setIsDropdownOpen(false);
  };

  // SKTaxi: createdAt(Timestamp) → millis 안전 변환
  const getCreatedAtMs = (p: Party): number => {
    const v: any = (p as any).createdAt;
    if (!v) return 0;
    if (typeof v === 'number') return v;
    if (typeof v?.toMillis === 'function') return v.toMillis();
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.getTime() : 0;
  };

  // SKTaxi: 하버사인 거리(m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const getDistanceMeters = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number => {
    if ([lat1, lon1, lat2, lon2].some((n) => typeof n !== 'number' || !Number.isFinite(n as number))) {
      return Number.POSITIVE_INFINITY;
    }
    const R = 6371000;
    const dLat = toRad((lat2 as number) - (lat1 as number));
    const dLon = toRad((lon2 as number) - (lon1 as number));
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1 as number)) * Math.cos(toRad(lat2 as number)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // SKTaxi: 정렬된 파티 목록 (status === 'ended' 인 파티는 상위 훅에서 이미 제외됨)
  const sortedParties = useMemo(() => {
    if (!Array.isArray(parties)) return [] as Party[];
    if (selectedSort === '최신순') {
      return [...parties].sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
    }
    if (selectedSort === '가까운순') {
      if (!isLocationAvailable) {
        // 이 경우는 드롭다운에서 이미 최신순으로 복귀시켰지만, 이중 안전장치
        return [...parties].sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
      }
      const { latitude, longitude } = location;
      return [...parties].sort((a, b) => {
        const da = getDistanceMeters(latitude, longitude, a?.departure?.lat, a?.departure?.lng);
        const db = getDistanceMeters(latitude, longitude, b?.departure?.lat, b?.departure?.lng);
        return da - db;
      });
    }
    return parties;
  }, [parties, selectedSort, location, isLocationAvailable]);

  // 드롭다운 외부 터치 시 닫기
  useEffect(() => {
    const handlePressOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    return () => {
      // cleanup은 필요 없음
    };
  }, [isDropdownOpen]);

  const animatedMarginTop = useAnimatedStyle(() => {
    const margin = interpolate(
      animatedPosition.value,
      [0, 500], // 예상 범위 조정
      [top - BOTTOMSHEET_HANDLE_HEIGHT, 0],
      Extrapolation.CLAMP // 범위 초과 시 클램프
    );
    return { marginTop: margin };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      animatedPosition.value,
      [0,
        ( Math.min(WINDOW_WIDTH, ( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT) / 2) === WINDOW_WIDTH )
        ? WINDOW_WIDTH - BOTTOMSHEET_HANDLE_HEIGHT
        : (( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT ) / 2) - BOTTOMSHEET_HANDLE_HEIGHT
      ],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // SKTaxi: 빈 상태 컴포넌트
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconMaterial name="car-off" size={120} color={COLORS.text.disabled} />
      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyTitle}>모집 중인 파티가 없어요</Text>
        <Text style={styles.emptySubtitle}>첫 번째 파티를 만들어보세요!</Text>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
      <View style={{ flexGrow: 1 }}>
        <AnimatedReanimated.View style={[styles.headerContainer, animatedMarginTop]}>
          <Text style={[styles.header]}>모집 중인 택시 파티</Text>
          <View style={styles.headerRightContainer}>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.headerRightText}>{selectedSort}</Text>
                <Icon
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        selectedSort === option.label && styles.dropdownItemSelected
                      ]}
                      onPress={() => handleSortSelect(option)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedSort === option.label && styles.dropdownItemTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.headerButton} onPress={onToggleBottomSheet}>
              <Animated.View style={animatedIconStyle}>
                <Icon
                  name={"chevron-down"}
                  size={32}
                  color={COLORS.accent.green}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </AnimatedReanimated.View>
        <FlatList
          data={sortedParties}
          keyExtractor={(item, index) => (item.id ? String(item.id) : `${item.leaderId}-${item.departureTime}-${index}`)}
          contentContainerStyle={{ paddingBottom: bottomSheetIndex === 0 ? WINDOW_WIDTH + 300 : 400}}
          showsVerticalScrollIndicator={false}
          style={{ height: '100%'}}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item: party, index }) => {
            const isSelected = selectedPartyId === party.id;
            return (
              <TouchableOpacity
                key={party.id}
                onPress={() => onPressParty(party, index)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.card,
                    isSelected && (styles.cardSelected),
                    (party.status === 'closed' || party.status === 'arrived') && styles.cardClosed,
                  ]}
                >
                  <View style={styles.timeContainer}>
                    <Text style={styles.time}>{formatKoreanAmPmTime(party.departureTime)} 출발</Text>
                    <Text style={[
                      styles.members,
                      (party.status === 'closed' || party.status === 'arrived' || (Array.isArray(party.members) && party.members.length >= party.maxMembers)) && styles.membersFull
                    ]}>
                      {party.status === 'closed'
                        ? '모집 마감'
                        : party.status === 'arrived'
                          ? '도착 완료'
                          : `${Array.isArray(party.members) ? party.members.length : party.members}/${party.maxMembers}명`}
                    </Text>
                  </View>
                  <View style={styles.placeContainer}>
                    <Text style={styles.place}>{party.departure.name} → {party.destination.name}</Text>
                    <Text style={styles.leader}>리더 : {displayNameMap[party.leaderId] || party.leaderId}</Text>
                  </View>
                  <View style={styles.tagsContainer}>
                    <View style={styles.tags}>
                      {(party.tags || []).map((tag: string) => (
                        <Text key={tag} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                    <Icon name={isSelected ? "caret-up" : "caret-down"} size={24} color={COLORS.text.primary} />
                  </View>
                  {isSelected && (
                    <View style={styles.selectedContainer}>
                      {party.detail && (
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>{party.detail || ''}</Text>
                      </View>
                      )}
                      <Button
                        title={
                          party.status === 'closed'
                            ? '모집 마감된 파티'
                            : party.status === 'arrived'
                              ? '도착 완료된 파티'
                              : party.id === myPartyId
                                ? '내가 속한 파티'
                                : pendingRequest?.partyId === party.id
                                  ? '동승 요청중...'
                                : Array.isArray(party.members) && party.members.length >= party.maxMembers
                                  ? '파티가 가득 찼어요'
                                  : '동승 요청'
                        }
                        disabled={
                          party.status === 'closed' ||
                          party.status === 'arrived' ||
                          party.id === myPartyId ||
                          (Array.isArray(party.members) && party.members.length >= party.maxMembers)
                        }
                        onPress={async () => {
                          if (!user) return;

                          if (party.status === 'closed') {
                            (globalThis as any)?.alert?.('이 파티는 모집이 마감되었어요.');
                            return;
                          }

                          if (party.status === 'arrived') {
                            (globalThis as any)?.alert?.('이 파티는 이미 도착 완료되었어요.');
                            return;
                          }

                          // SKTaxi: 파티가 가득 찬 경우
                          if (Array.isArray(party.members) && party.members.length >= party.maxMembers) {
                            (globalThis as any)?.alert?.('이 파티는 이미 가득 찼어요.');
                            return;
                          }

                          // SKTaxi: 이미 다른 파티에 소속되어 있는지 확인
                          if (hasParty && party.id !== myPartyId) {
                            (globalThis as any)?.alert?.('이미 다른 파티에 소속되어 있어요. 파티를 탈퇴하고 다시 요청해주세요.');
                            return;
                          }

                          // SKTaxi: 현재 파티에 pending 요청이 있으면 AcceptancePendingScreen으로 이동
                          if (pendingRequest?.partyId === party.id && pendingRequest?.requestId) {
                            navigation.navigate('AcceptancePending', { party, requestId: pendingRequest.requestId });
                            return;
                          }

                          // SKTaxi: 다른 파티에 pending 요청이 있는 경우 확인 Alert
                          if (pendingRequest?.partyId && pendingRequest?.requestId) {
                            const confirmCancel = await new Promise<boolean>((resolve) => {
                              Alert.alert(
                                '동승 요청 취소',
                                '이미 동승을 요청한 파티가 있어요. 그 요청을 취소하고 이 파티에 동승요청을 할까요?',
                                [
                                  {
                                    text: '취소',
                                    style: 'cancel',
                                    onPress: () => resolve(false),
                                  },
                                  {
                                    text: '확인',
                                    onPress: () => resolve(true),
                                  },
                                ]
                              );
                            });

                            if (!confirmCancel) return;

                            // SKTaxi: 기존 요청 취소 (Repository 패턴)
                            try {
                              await cancelJoinRequest(pendingRequest.requestId);
                            } catch (e) {
                              console.warn('기존 요청 취소 실패:', e);
                            }
                          }

                          try {
                            // SKTaxi: 동승 요청 생성 (Repository 패턴)
                            const leaderId = (party as any).leaderId ?? (party as any).leader;
                            const requestId = await createJoinRequest(party.id!, leaderId);

                            // Analytics: 동승 요청 이벤트 로깅
                            await logEvent('party_join_requested', {
                              party_id: party.id ?? '',
                              request_id: requestId,
                            });

                            // SKTaxi: 수락 대기 화면으로 이동 (requestId 전달)
                            navigation.navigate('AcceptancePending', { party, requestId });
                          } catch (e) {
                            console.warn('requestJoin failed', e);
                          }
                        }}
                      />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    zIndex: 1000,
  },
  headerRightContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.background.card,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 32 + 10,
    right: 0,
    backgroundColor: COLORS.background.dropdown,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.accent.green + '20',
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  dropdownItemTextSelected: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  headerButton: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
  },
  headerRightText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    transform: [{ scale: 1 }],
    height: PARTY_CARD_HEIGHT,
    gap: 8,
  },
  cardSelected: {
    outlineWidth: 2,
    outlineColor: COLORS.accent.green,
    shadowColor: COLORS.accent.green,
    shadowOpacity: 0.2,
    elevation: 4,
    height: 'auto',
  },
  cardClosed: {
    opacity: 0.5,
  },
  placeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  place: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  leader: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
  },
  members: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  membersFull: {
    color: '#FF6B6B', // SKTaxi: 파티가 가득 찬 경우 붉은색
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  tag: {
    backgroundColor: COLORS.accent.green,
    color: COLORS.text.buttonText,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    ...TYPOGRAPHY.caption1,
  },
  selectedContainer: {
    marginTop: 8,
    gap: 16,
  },
  detail: {
    padding: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
  },
  detailText: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    height: WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT - Math.min(WINDOW_WIDTH, ( WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT) / 2) - 60 - 30,
  },
  emptyTextContainer: {
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

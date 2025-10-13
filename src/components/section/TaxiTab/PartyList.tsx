import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { BOTTOMSHEET_HANDLE_HEIGHT, PARTY_CARD_HEIGHT } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import AnimatedReanimated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { BOTTOM_TAB_BAR_HEIGHT } from '../../../constants/constants';
import { Party } from '../../../types/party';
// SKTaxi: 동승 요청 생성 핸들러 구현을 위한 Firebase 의존성 추가 (모듈식)
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore, { addDoc, collection, serverTimestamp } from '@react-native-firebase/firestore';
import Button from '../../common/Button';
import { useUserDisplayNames } from '../../../hooks/useUserDisplayNames'; // SKTaxi: uid->displayName 매핑 훅 추가
import { formatKoreanAmPmTime } from '../../../utils/datetime'; // SKTaxi: 시간 포맷 유틸
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaxiStackParamList } from '../../../navigations/types';
import { useMyParty } from '../../../hooks/useMyParty'; // SKTaxi: 사용자 파티 소속 여부 확인


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
  const { top, bottom } = useSafeAreaInsets();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('최신순');
  const navigation = useNavigation<NativeStackNavigationProp<TaxiStackParamList>>();

  // SKTaxi: 리더 uid들을 수집해 displayName 매핑
  const leaderUids = parties.map((p) => p.leaderId).filter(Boolean) as string[];
  const { displayNameMap } = useUserDisplayNames(leaderUids);

  // SKTaxi: 사용자 파티 소속 여부 확인
  const { hasParty, partyId: myPartyId } = useMyParty();

  const sortOptions = [
    { label: '최신순', value: 'latest' },
    { label: '가까운순', value: 'distance' },
  ];

  const handleSortSelect = (option: { label: string; value: string }) => {
    setSelectedSort(option.label);
    setIsDropdownOpen(false);
    // TODO: 실제 정렬 로직 구현
    console.log('정렬 옵션 선택:', option.value);
  };

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
      [0, WINDOW_WIDTH - top], // adjust according to bottomsheet height range
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
      <Image 
        source={require('../../../../assets/images/empty_taxi_party.png')} 
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>모집 중인 파티가 없어요</Text>
      <Text style={styles.emptySubtitle}>첫 번째 파티를 만들어보세요!</Text>
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
        data={parties}
        keyExtractor={(item, index) => (item.id ? String(item.id) : `${item.leaderId}-${item.departureTime}-${index}`)}
        contentContainerStyle={{ paddingBottom: bottomSheetIndex === 0 ? WINDOW_WIDTH + 250 : 350}}
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
                ]}
              >
                <View style={styles.timeContainer}>
                  <Text style={styles.time}>{formatKoreanAmPmTime(party.departureTime)}</Text>
                  <Text style={[
                    styles.members,
                    Array.isArray(party.members) && party.members.length >= party.maxMembers && styles.membersFull
                  ]}>
                    {Array.isArray(party.members) ? party.members.length : party.members}/{party.maxMembers}명
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
                    <View style={styles.detail}>
                      <Text style={styles.detailText}>{party.detail || ''}</Text>  
                    </View>
                    <Button
                      title={
                        party.id === myPartyId 
                          ? "내가 속한 파티" 
                          : Array.isArray(party.members) && party.members.length >= party.maxMembers
                            ? "파티가 가득 찼어요"
                            : "동승 요청"
                      }
                      disabled={
                        party.id === myPartyId || 
                        (Array.isArray(party.members) && party.members.length >= party.maxMembers)
                      }
                      onPress={async () => {
                        const user = auth(getApp()).currentUser;
                        if (!user) return;

                        // SKTaxi: 파티가 가득 찬 경우
                        if (Array.isArray(party.members) && party.members.length >= party.maxMembers) {
                          // eslint-disable-next-line no-alert
                          (globalThis as any)?.alert?.('이 파티는 이미 가득 찼어요.');
                          return;
                        }

                        // SKTaxi: 이미 다른 파티에 소속되어 있는지 확인
                        if (hasParty && party.id !== myPartyId) {
                          // eslint-disable-next-line no-alert
                          (globalThis as any)?.alert?.('이미 다른 파티에 소속되어 있어요. 파티를 탈퇴하고 다시 요청해주세요.');
                          return;
                        }

                        try {
                        const ref = await addDoc(collection(firestore(getApp()), 'joinRequests'), {
                            partyId: party.id,
                            leaderId: (party as any).leaderId ?? (party as any).leader,
                            requesterId: user.uid,
                            status: 'pending',
                            createdAt: serverTimestamp(),
                          });
                          // SKTaxi: UX 피드백
                          // eslint-disable-next-line no-alert
                          (globalThis as any)?.alert?.('방장에게 요청을 보냈어요.');
                        // SKTaxi: 수락 대기 화면으로 이동 (requestId 전달)
                        navigation.navigate('AcceptancePending', { party, requestId: ref.id });
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 180,
    height: 180,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

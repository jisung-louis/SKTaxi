import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback } from 'react-native';
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
import Button from '../../common/Button';


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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottomSheetIndex === 0 ? WINDOW_WIDTH + 200 : 300}}
        showsVerticalScrollIndicator={false}
        style={{ height: '100%'}}
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
                  <Text style={styles.time}>{party.departureTime}</Text>
                  <Text style={styles.members}>{party.members}/{party.maxMembers}명</Text>
                </View>
                <View style={styles.placeContainer}>
                  <Text style={styles.place}>{party.departure} → {party.destination}</Text>
                  <Text style={styles.leader}>리더 : {party.leader}</Text>
                </View>
                <View style={styles.tagsContainer}>
                  <View style={styles.tags}>
                    {party.tags.map((tag: string) => (
                      <Text key={tag} style={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                  <Icon name={isSelected ? "caret-up" : "caret-down"} size={24} color={COLORS.text.primary} />
                </View>
                {isSelected && (
                  <View style={styles.selectedContainer}>
                    <View style={styles.detail}>
                      <Text style={styles.detailText}>{party.description}</Text>  
                    </View>
                    <Button
                      title="동승 요청"
                      onPress={() => onRequestJoinParty(party)}
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
    backgroundColor: COLORS.background.card,
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
});

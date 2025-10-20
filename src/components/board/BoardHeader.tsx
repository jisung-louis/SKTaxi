import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { collection, query, where, getCountFromServer } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BOARD_CATEGORIES, SORT_OPTIONS } from '../../constants/board';
import { BoardCategory, BoardSearchFilters } from '../../types/board';
import { db } from '../../config/firebase';

interface BoardHeaderProps {
  selectedCategory: string | null;
  sortBy: string;
  onCategoryChange: (category: string | null) => void;
  onSortChange: (sortBy: string) => void;
  onSearchPress: () => void;
  onWritePress: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
  onSearchPress,
  onWritePress,
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [categoryModalReady, setCategoryModalReady] = useState(false);
  const [sortModalReady, setSortModalReady] = useState(false);

  const selectedCategoryData = selectedCategory 
    ? BOARD_CATEGORIES.find(cat => cat.id === selectedCategory)
    : null;

  const selectedSortData = SORT_OPTIONS.find(option => option.value === sortBy);

  // 각 카테고리별 게시물 수 가져오기
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoadingCounts(true);
        const counts: Record<string, number> = {};

        // 전체 게시물 수
        const allQuery = query(
          collection(db, 'boardPosts'),
          where('isDeleted', '==', false)
        );
        const allSnapshot = await getCountFromServer(allQuery);
        counts['all'] = allSnapshot.data().count;

        // 각 카테고리별 게시물 수
        for (const category of BOARD_CATEGORIES) {
          const categoryQuery = query(
            collection(db, 'boardPosts'),
            where('isDeleted', '==', false),
            where('category', '==', category.id)
          );
          const categorySnapshot = await getCountFromServer(categoryQuery);
          counts[category.id] = categorySnapshot.data().count;
        }

        setCategoryCounts(counts);
      } catch (error) {
        console.error('카테고리별 게시물 수 조회 실패:', error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  // 모달 상태 변화 감지
  useEffect(() => {
    if (showCategoryModal) {
      const timer = setTimeout(() => setCategoryModalReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      setCategoryModalReady(false);
    }
  }, [showCategoryModal]);

  useEffect(() => {
    if (showSortModal) {
      const timer = setTimeout(() => setSortModalReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      setSortModalReady(false);
    }
  }, [showSortModal]);

  const handleCategorySelect = (category: BoardCategory | null) => {
    onCategoryChange(category?.id || null);
    setShowCategoryModal(false);
  };

  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    setShowSortModal(false);
  };

  const renderCategoryItem = ({ item }: { item: BoardCategory }) => {
    const count = loadingCounts ? '...' : (categoryCounts[item.id] || 0);
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && styles.modalItemSelected
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <View style={styles.modalItemLeft}>
          <View style={[styles.categoryIndicator, { backgroundColor: item.color }]} />
          <Text style={[
            styles.modalItemText,
            isSelected && styles.modalItemTextSelected
          ]}>
            {item.name}
          </Text>
        </View>
        <View style={[styles.modalItemCount, isSelected && styles.modalItemCountSelected]}>
          <Text style={[styles.modalItemCountText, isSelected && styles.modalItemCountTextSelected]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortItem = ({ item }: { item: { value: string; label: string } }) => {
    const isSelected = sortBy === item.value;
    const getSortIcon = (value: string) => {
      switch (value) {
        case 'latest': return 'time-outline';
        case 'popular': return 'flame-outline';
        case 'comments': return 'chatbubble-outline';
        case 'views': return 'eye-outline';
        default: return 'swap-vertical-outline';
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && styles.modalItemSelected
        ]}
        onPress={() => handleSortSelect(item.value)}
      >
        <View style={styles.modalItemLeft}>
          <Icon 
            name={getSortIcon(item.value)} 
            size={16} 
            color={isSelected ? COLORS.accent.blue : COLORS.text.secondary} 
          />
          <Text style={[
            styles.modalItemText,
            isSelected && styles.modalItemTextSelected
          ]}>
            {item.label}
          </Text>
        </View>
        {isSelected && (
          <Icon name="checkmark" size={16} color={COLORS.accent.blue} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.titleContainer} onPress={() => setShowCategoryModal(true)}>
          <Text style={styles.title}>{selectedCategoryData?.name || '전체 게시판'}</Text>
          <Icon name="chevron-down" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowSortModal(true)}>
            <Icon name="swap-vertical-outline" size={30} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <Icon name="search-outline" size={30} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onWritePress}>
            <Icon name="create-outline" size={30} color={COLORS.accent.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, selectedCategory && styles.filterButtonActive]}
          onPress={() => setShowCategoryModal(true)}
        >
          <View style={styles.filterButtonContent}>
            <View style={styles.filterButtonLeft}>
              {selectedCategoryData && (
                <View style={[styles.categoryIndicator, { backgroundColor: selectedCategoryData.color }]} />
              )}
              <Text style={[styles.filterButtonText, selectedCategory && styles.filterButtonTextActive]}>
                {selectedCategoryData ? selectedCategoryData.name : '전체'}
              </Text>
            </View>
            <Icon name="chevron-down" size={16} color={selectedCategory ? COLORS.accent.blue : COLORS.text.secondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, styles.sortButton]}
          onPress={() => setShowSortModal(true)}
        >
          <View style={styles.filterButtonContent}>
            <View style={styles.filterButtonLeft}>
              <Icon name="swap-vertical-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.filterButtonText}>
                {selectedSortData?.label || '최신순'}
              </Text>
            </View>
            <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
          </View>
        </TouchableOpacity>
      </View> */}

      {/* 카테고리 선택 모달 */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (categoryModalReady) {
              setShowCategoryModal(false);
            }
          }}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>카테고리 선택</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Icon name="close" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.modalItem,
                !selectedCategory && styles.modalItemSelected
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <View style={styles.modalItemLeft}>
                <View style={styles.allCategoryIndicator} />
                <Text style={[
                  styles.modalItemText,
                  !selectedCategory && styles.modalItemTextSelected
                ]}>
                  전체
                </Text>
              </View>
              <View style={styles.modalItemCount}>
                <Text style={styles.modalItemCountText}>
                  {loadingCounts ? '...' : (categoryCounts['all'] || 0)}
                </Text>
              </View>
            </TouchableOpacity>
            <FlatList
              data={BOARD_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>

      {/* 정렬 선택 모달 */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (sortModalReady) {
              setShowSortModal(false);
            }
          }}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>정렬 기준</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowSortModal(false)}
              >
                <Icon name="close" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={SORT_OPTIONS}
              renderItem={renderSortItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent.blue + '10',
    borderColor: COLORS.accent.blue + '30',
  },
  sortButton: {
    flex: 0.8,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border.primary,
  },
  modalTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
  },
  modalItemSelected: {
    backgroundColor: COLORS.accent.blue + '08',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  allCategoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text.secondary,
  },
  modalItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  modalItemCount: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  modalItemCountSelected: {
    backgroundColor: COLORS.accent.blue + '15',
  },
  modalItemCountText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  modalItemCountTextSelected: {
    color: COLORS.accent.blue,
  },
});

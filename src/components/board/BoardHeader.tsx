import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { collection, query, where, getCountFromServer } from '@react-native-firebase/firestore';
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
    
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          selectedCategory === item.id && styles.modalItemSelected
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
        <Text style={[
          styles.modalItemText,
          selectedCategory === item.id && styles.modalItemTextSelected
        ]}>
          {item.name}
        </Text>
        <Text style={styles.modalItemCount}>({count})</Text>
      </TouchableOpacity>
    );
  };

  const renderSortItem = ({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        sortBy === item.value && styles.modalItemSelected
      ]}
      onPress={() => handleSortSelect(item.value)}
    >
      <Text style={[
        styles.modalItemText,
        sortBy === item.value && styles.modalItemTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>게시판</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <Text style={styles.actionButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onWritePress}>
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedCategoryData ? selectedCategoryData.name : '전체'}
          </Text>
          <Text style={styles.filterButtonIcon}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedSortData?.label || '최신순'}
          </Text>
          <Text style={styles.filterButtonIcon}>▼</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            <TouchableOpacity
              style={[
                styles.modalItem,
                !selectedCategory && styles.modalItemSelected
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text style={[
                styles.modalItemText,
                !selectedCategory && styles.modalItemTextSelected
              ]}>
                전체
              </Text>
              <Text style={styles.modalItemCount}>
                ({loadingCounts ? '...' : (categoryCounts['all'] || 0)})
              </Text>
            </TouchableOpacity>
            <FlatList
              data={BOARD_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
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
            <Text style={styles.modalTitle}>정렬 기준</Text>
            <FlatList
              data={SORT_OPTIONS}
              renderItem={renderSortItem}
              keyExtractor={(item) => item.value}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginRight: 4,
  },
  filterButtonIcon: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalItemSelected: {
    backgroundColor: COLORS.accent.blue + '20',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  modalItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  modalItemTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  modalItemCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
});

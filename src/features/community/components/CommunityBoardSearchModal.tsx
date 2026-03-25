import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  FilterChips,
  type FilterChipItem,
} from '@/shared/design-system/components';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

import type {CommunityBoardSearchFilters} from '../model/communityHomeData';

interface CommunityBoardSearchModalProps {
  currentFilters: CommunityBoardSearchFilters;
  onClose: () => void;
  onSearch: (filters: CommunityBoardSearchFilters) => void;
  visible: boolean;
}

type CategoryFilterValue =
  | ''
  | NonNullable<CommunityBoardSearchFilters['category']>;

const CATEGORY_OPTIONS = [
  {id: '', label: '전체'},
  {id: 'general', label: '자유게시판'},
  {id: 'question', label: '질문게시판'},
  {id: 'review', label: '후기게시판'},
  {id: 'announcement', label: '정보게시판'},
] as const;

const SORT_OPTIONS = [
  {id: 'latest', label: '최신순'},
  {id: 'popular', label: '인기순'},
  {id: 'mostCommented', label: '댓글많은순'},
  {id: 'mostViewed', label: '조회많은순'},
] as const;

export const CommunityBoardSearchModal = ({
  currentFilters,
  onClose,
  onSearch,
  visible,
}: CommunityBoardSearchModalProps) => {
  const [searchText, setSearchText] = React.useState(
    currentFilters.searchText ?? '',
  );
  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryFilterValue>(currentFilters.category ?? '');
  const [sortBy, setSortBy] = React.useState(currentFilters.sortBy);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setSearchText(currentFilters.searchText ?? '');
    setSelectedCategory(currentFilters.category ?? '');
    setSortBy(currentFilters.sortBy);
  }, [currentFilters, visible]);

  const categoryItems: FilterChipItem<CategoryFilterValue>[] =
    CATEGORY_OPTIONS.map(option => ({
      id: option.id,
      label: option.label,
      selected: option.id === selectedCategory,
    }));

  const sortItems: FilterChipItem<CommunityBoardSearchFilters['sortBy']>[] =
    SORT_OPTIONS.map(option => ({
      id: option.id,
      label: option.label,
      selected: option.id === sortBy,
    }));

  const handleReset = React.useCallback(() => {
    setSearchText('');
    setSelectedCategory('');
    setSortBy('latest');
  }, []);

  const handleApply = React.useCallback(() => {
    onSearch({
      category: selectedCategory || undefined,
      searchText: searchText.trim() || undefined,
      sortBy,
    });
    onClose();
  }, [onClose, onSearch, searchText, selectedCategory, sortBy]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.headerSideLabel}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>검색</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={handleReset}>
            <Text style={styles.headerActionLabel}>초기화</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>검색어</Text>
            <TextInput
              onChangeText={setSearchText}
              placeholder="제목, 내용으로 검색"
              placeholderTextColor={COLORS.text.muted}
              style={styles.searchInput}
              value={searchText}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}>
              <FilterChips
                inactiveVariant="surface"
                items={categoryItems}
                onPressItem={setSelectedCategory}
              />
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정렬</Text>
            <View style={styles.sortGrid}>
              {sortItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setSortBy(item.id)}
                  style={[
                    styles.sortOption,
                    item.selected ? styles.sortOptionSelected : null,
                  ]}>
                  <Text
                    style={[
                      styles.sortLabel,
                      item.selected ? styles.sortLabelSelected : null,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.9}
            onPress={handleApply}
            style={styles.applyButton}>
            <Text style={styles.applyButtonLabel}>검색</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerSideLabel: {
    color: COLORS.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  headerActionLabel: {
    color: COLORS.accent.blue,
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },
  horizontalContent: {
    paddingRight: SPACING.lg,
  },
  sortGrid: {
    gap: SPACING.sm,
  },
  sortOption: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.accent.blueSoft,
  },
  sortLabel: {
    color: COLORS.text.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  sortLabelSelected: {
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    minHeight: 54,
  },
  applyButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BoardSearchFilters } from '../../types/board';

interface BoardSearchProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: BoardSearchFilters) => void;
  currentFilters: BoardSearchFilters;
}

export const BoardSearch: React.FC<BoardSearchProps> = ({
  visible,
  onClose,
  onSearch,
  currentFilters,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'mostCommented' | 'mostViewed'>(currentFilters.sortBy || 'latest');

  const categories = [
    { id: '', name: '전체' },
    { id: 'general', name: '자유게시판' },
    { id: 'question', name: '질문게시판' },
    { id: 'review', name: '후기게시판' },
    { id: 'announcement', name: '공지사항' },
  ];

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'mostCommented', label: '댓글많은순' },
    { value: 'mostViewed', label: '조회많은순' },
  ];


  const handleSearch = () => {
    const filters: BoardSearchFilters = {
      sortBy: sortBy as any,
    };

    if (searchText.trim()) {
      filters.searchText = searchText.trim();
    }

    if (selectedCategory) {
      filters.category = selectedCategory;
    }


    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategory('');
    setSortBy('latest');
  };


  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSortItem = ({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.sortItem,
        sortBy === item.value && styles.sortItemSelected
      ]}
      onPress={() => setSortBy(item.value as 'latest' | 'popular' | 'mostCommented' | 'mostViewed')}
    >
      <Text style={[
        styles.sortText,
        sortBy === item.value && styles.sortTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>검색</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>검색어</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="제목, 내용으로 검색"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            />
          </View>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정렬</Text>
            <FlatList
              data={sortOptions}
              renderItem={renderSortItem}
              keyExtractor={(item) => item.value}
              style={styles.sortList}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  cancelText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  resetText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.blue,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  categoryList: {
    marginTop: -4,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    marginRight: 8,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.accent.blue,
  },
  categoryText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  categoryTextSelected: {
    color: COLORS.text.white,
    fontWeight: '600',
  },
  sortList: {
    marginTop: -4,
  },
  sortItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    marginBottom: 4,
  },
  sortItemSelected: {
    backgroundColor: COLORS.accent.blue + '20',
  },
  sortText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  sortTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: COLORS.accent.blue,
    margin: 16,
    marginBottom: 50,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
});

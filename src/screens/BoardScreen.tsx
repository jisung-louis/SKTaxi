import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { BoardSearchFilters } from '../types/board';
import { useBoardPosts } from '../hooks/useBoardPosts';
import { usePostActions } from '../hooks/usePostActions';
import { BoardHeader } from '../components/board/BoardHeader';
import { BoardSearch } from '../components/board/BoardSearch';
import { PostCard } from '../components/board/PostCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { TYPOGRAPHY } from '../constants/typhograpy';

export const BoardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showSearch, setShowSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState<BoardSearchFilters>({ sortBy: 'latest' });

  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useBoardPosts(searchFilters);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  // 해시태그 검색 처리
  useEffect(() => {
    const params = route?.params;
    if (params?.searchText && params?.fromHashtag) {
      setSearchFilters(prev => ({
        ...prev,
        searchText: params.searchText,
      }));
      // 파라미터 초기화
      navigation.setParams({ searchText: undefined, fromHashtag: undefined });
    }
  }, [route?.params, navigation]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSearchFilters(prev => ({
      ...prev,
      category: category || undefined,
    }));
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setSearchFilters(prev => ({
      ...prev,
      sortBy: sort as any,
    }));
  }, []);

  const handleSearch = useCallback((filters: BoardSearchFilters) => {
    setSearchFilters(filters);
    setSelectedCategory(filters.category || null);
    setSortBy(filters.sortBy);
  }, []);

  const handlePostPress = useCallback((post: any) => {
    // 게시글 상세 페이지로 이동 (조회수는 상세 페이지에서 증가)
    navigation.navigate('BoardDetail', { postId: post.id });
  }, [navigation]);


  const handleWritePress = useCallback(() => {
    navigation.navigate('BoardWrite');
  }, [navigation]);

  const renderPost = useCallback(({ item }: { item: any }) => (
    <PostCard
      post={item}
      onPress={handlePostPress}
    />
  ), [handlePostPress]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return <LoadingSpinner size="small" style={styles.loadingMore} />;
    }
    return null;
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return <LoadingSpinner style={styles.emptyLoading} />;
    }
    
    if (error) {
      return <ErrorMessage message={error} onRetry={refresh} />;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>게시글이 없습니다</Text>
        <Text style={styles.emptySubtext}>첫 번째 게시글을 작성해보세요!</Text>
      </View>
    );
  }, [loading, error, refresh]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        <BoardHeader
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onSearchPress={() => setShowSearch(true)}
          onWritePress={handleWritePress}
        />

        {/* 검색어 표시 */}
        {searchFilters.searchText && (
          <View style={[
            styles.searchResultContainer,
            searchFilters.searchText.startsWith('#') && styles.hashtagSearchContainer
          ]}>
            <Text style={[
              styles.searchResultText,
              searchFilters.searchText.startsWith('#') && styles.hashtagSearchText
            ]}>
              {searchFilters.searchText.startsWith('#') 
                ? `${searchFilters.searchText} 해시태그 검색 결과`
                : `"${searchFilters.searchText}" 검색 결과`
              }
            </Text>
            <TouchableOpacity 
              onPress={() => setSearchFilters(prev => ({ ...prev, searchText: undefined }))}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading && !loadingMore}
              onRefresh={refresh}
              colors={[COLORS.accent.blue]}
              tintColor={COLORS.accent.blue}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />

        <BoardSearch
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
          currentFilters={searchFilters}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingMore: {
    marginVertical: 16,
  },
  emptyLoading: {
    marginTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  searchResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  hashtagSearchContainer: {
    backgroundColor: COLORS.accent.blue + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.blue,
  },
  searchResultText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  hashtagSearchText: {
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.tertiary,
  },
});
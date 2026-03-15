import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks/useScreenView';

import { BoardHeader, BoardSearch, PostCard } from '../components';
import { useBoardPosts } from '../hooks/useBoardPosts';
import type { BoardStackParamList } from '../model/navigation';
import type { BoardPost, BoardSearchFilters } from '../model/types';

export const BoardScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<BoardStackParamList>>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showSearch, setShowSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState<BoardSearchFilters>({
    sortBy: 'latest',
  });

  const { posts, loading, loadingMore, error, loadMore, refresh } = useBoardPosts(searchFilters);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused, opacity, translateY]);

  useEffect(() => {
    const params = route?.params;
    if (params?.searchText && params?.fromHashtag) {
      setSearchFilters((prev) => ({
        ...prev,
        searchText: params.searchText,
      }));
      navigation.setParams({ searchText: undefined, fromHashtag: undefined });
    }
  }, [navigation, route?.params]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSearchFilters((prev) => ({
      ...prev,
      category: category || undefined,
    }));
  }, []);

  const handleSortChange = useCallback((nextSortBy: string) => {
    setSortBy(nextSortBy);
    setSearchFilters((prev) => ({
      ...prev,
      sortBy: nextSortBy as BoardSearchFilters['sortBy'],
    }));
  }, []);

  const handleSearch = useCallback((filters: BoardSearchFilters) => {
    setSearchFilters(filters);
    setSelectedCategory(filters.category || null);
    setSortBy(filters.sortBy);
  }, []);

  const handlePostPress = useCallback(
    (post: BoardPost) => {
      navigation.navigate('BoardDetail', { postId: post.id });
    },
    [navigation],
  );

  const handleWritePress = useCallback(() => {
    navigation.navigate('BoardWrite');
  }, [navigation]);

  const renderPost = useCallback(
    ({ item }: { item: BoardPost }) => <PostCard post={item} onPress={handlePostPress} />,
    [handlePostPress],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) {
      return null;
    }
    return <LoadingSpinner size="small" style={styles.loadingMore} />;
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
  }, [error, loading, refresh]);

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

        {searchFilters.searchText && (
          <View
            style={[
              styles.searchResultContainer,
              searchFilters.searchText.startsWith('#') && styles.hashtagSearchContainer,
            ]}
          >
            <Text
              style={[
                styles.searchResultText,
                searchFilters.searchText.startsWith('#') && styles.hashtagSearchText,
              ]}
            >
              {searchFilters.searchText.startsWith('#')
                ? `${searchFilters.searchText} 해시태그 검색 결과`
                : `"${searchFilters.searchText}" 검색 결과`}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSearchFilters((prev) => ({ ...prev, searchText: undefined }))
              }
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
          onEndReached={() => {
            void loadMore();
          }}
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
    paddingBottom: 72,
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
  emptySubtext: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.disabled,
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
    backgroundColor: `${COLORS.accent.blue}20`,
  },
  searchResultText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  hashtagSearchText: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  clearSearchButton: {
    paddingLeft: 12,
  },
  clearSearchText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
});

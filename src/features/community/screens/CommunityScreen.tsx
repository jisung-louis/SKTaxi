import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import {
  V2PageHeader,
  V2SegmentedControl,
} from '@/shared/design-system/components';
import type {CommunityStackParamList} from '@/app/navigation/types';
import {useScreenEnterAnimation} from '@/shared/hooks';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';

import {CommunityBoardSearchModal} from '../components/CommunityBoardSearchModal';
import {CommunityBoardSegment} from '../components/CommunityBoardSegment';
import {useCommunityBoardData} from '../hooks/useCommunityBoardData';
import {CommunityChatSegment} from '../components/CommunityChatSegment';
import {useCommunityChatData} from '../hooks/useCommunityChatData';
import type {CommunitySegmentId} from '../model/communityViewData';

const SEGMENTS = [
  {id: 'board', label: '게시판'},
  {id: 'chat', label: '채팅'},
] as const;

type CommunityNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'BoardMain'
>;
type CommunityRouteProp = RouteProp<CommunityStackParamList, 'BoardMain'>;

export const CommunityScreen = () => {
  const navigation = useNavigation<CommunityNavigationProp>();
  const route = useRoute<CommunityRouteProp>();
  const [selectedSegment, setSelectedSegment] =
    React.useState<CommunitySegmentId>('board');
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {
    error: boardError,
    filters: boardFilters,
    handleApplyRouteSearch,
    handleApplySearch,
    handleClearSearch,
    handleOpenPost,
    handleOpenWrite,
    handleRefresh: handleBoardRefresh,
    hasMore,
    items: boardItems,
    loadMore,
    loading: boardLoading,
    loadingMore,
    refreshing: boardRefreshing,
    searchVisible,
    setSearchVisible,
  } = useCommunityBoardData();
  const chat = useCommunityChatData();

  React.useEffect(() => {
    if (!route.params?.searchText || !route.params?.fromHashtag) {
      return;
    }

    setSelectedSegment('board');
    handleApplyRouteSearch(route.params.searchText);
    navigation.setParams({
      fromHashtag: undefined,
      searchText: undefined,
    });
  }, [
    handleApplyRouteSearch,
    navigation,
    route.params?.fromHashtag,
    route.params?.searchText,
  ]);

  const activeSearchLabel = boardFilters.searchText
    ? boardFilters.searchText.startsWith('#')
      ? `${boardFilters.searchText} 해시태그 검색 결과`
      : `"${boardFilters.searchText}" 검색 결과`
    : boardFilters.category
    ? '카테고리 필터가 적용되었습니다'
    : undefined;

  const handlePressHeaderAction = React.useCallback(() => {
    setSelectedSegment('board');
    setSearchVisible(true);
  }, [setSearchVisible]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        <View style={styles.headerSection}>
          <V2PageHeader
            actionAccessibilityLabel="커뮤니티 검색"
            onPressAction={handlePressHeaderAction}
            subtitle="학우들과 소통하고 정보를 나눠요"
            title="커뮤니티"
          />
        </View>

        <View style={styles.segmentSection}>
          <V2SegmentedControl
            items={SEGMENTS}
            onSelect={setSelectedSegment}
            selectedId={selectedSegment}
          />
        </View>

        <View style={styles.contentSection}>
          {selectedSegment === 'board' ? (
            <CommunityBoardSegment
              activeSearchLabel={activeSearchLabel}
              error={boardError}
              hasMore={hasMore}
              items={boardItems}
              loading={boardLoading}
              loadingMore={loadingMore}
              onClearSearch={handleClearSearch}
              onLoadMore={loadMore}
              onPressPost={handleOpenPost}
              onPressWrite={handleOpenWrite}
              onRefresh={handleBoardRefresh}
              refreshing={boardRefreshing}
            />
          ) : (
            <CommunityChatSegment
              loading={chat.loading}
              onPressRoom={chat.handleOpenRoom}
              onRefresh={chat.handleRefresh}
              refreshing={chat.refreshing}
              rooms={chat.rooms}
            />
          )}
        </View>
      </Animated.View>

      <CommunityBoardSearchModal
        currentFilters={boardFilters}
        onClose={() => setSearchVisible(false)}
        onSearch={handleApplySearch}
        visible={searchVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.sm,
  },
  segmentSection: {
    paddingHorizontal: V2_SPACING.lg,
  },
  contentSection: {
    flex: 1,
    paddingTop: V2_SPACING.xs,
  },
});

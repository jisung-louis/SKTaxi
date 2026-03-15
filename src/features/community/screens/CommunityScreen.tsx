import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  V2PageHeader,
  V2SegmentedControl,
  V2StateCard,
} from '@/shared/design-system/components';
import type {CommunityStackParamList} from '@/app/navigation/types';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';

import {CommunityBoardSearchModal} from '../components/CommunityBoardSearchModal';
import {CommunityBoardSegment} from '../components/CommunityBoardSegment';
import {useCommunityBoardData} from '../hooks/useCommunityBoardData';
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
  const board = useCommunityBoardData({navigation});

  React.useEffect(() => {
    if (!route.params?.searchText || !route.params?.fromHashtag) {
      return;
    }

    setSelectedSegment('board');
    board.handleApplyRouteSearch(route.params.searchText);
    navigation.setParams({
      fromHashtag: undefined,
      searchText: undefined,
    });
  }, [board, navigation, route.params?.fromHashtag, route.params?.searchText]);

  const activeSearchLabel = board.filters.searchText
    ? board.filters.searchText.startsWith('#')
      ? `${board.filters.searchText} 해시태그 검색 결과`
      : `"${board.filters.searchText}" 검색 결과`
    : board.filters.category
    ? '카테고리 필터가 적용되었습니다'
    : undefined;

  const handlePressHeaderAction = React.useCallback(() => {
    setSelectedSegment('board');
    board.setSearchVisible(true);
  }, [board]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            error={board.error}
            featuredPost={board.featuredPost}
            hasMore={board.hasMore}
            items={board.items}
            loading={board.loading}
            loadingMore={board.loadingMore}
            onClearSearch={board.handleClearSearch}
            onLoadMore={board.loadMore}
            onPressPost={board.handleOpenPost}
            onPressWrite={board.handleOpenWrite}
            onRefresh={board.handleRefresh}
            refreshing={board.refreshing}
          />
        ) : (
          <V2StateCard
            description="채팅 메인 화면을 준비하고 있습니다."
            icon={null}
            style={styles.placeholderCard}
            title="채팅 준비 중"
          />
        )}
      </View>

      <CommunityBoardSearchModal
        currentFilters={board.filters}
        onClose={() => board.setSearchVisible(false)}
        onSearch={board.handleApplySearch}
        visible={board.searchVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
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
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.md,
  },
  placeholderCard: {
    minHeight: 220,
  },
});

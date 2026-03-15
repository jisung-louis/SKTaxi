import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  V2PageHeader,
  V2SegmentedControl,
  V2StateCard,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';

import type {CommunitySegmentId} from '../model/communityViewData';

const SEGMENTS = [
  {id: 'board', label: '게시판'},
  {id: 'chat', label: '채팅'},
] as const;

export const CommunityScreen = () => {
  const [selectedSegment, setSelectedSegment] =
    React.useState<CommunitySegmentId>('board');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerSection}>
        <V2PageHeader
          actionAccessibilityLabel="커뮤니티 검색"
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
        <V2StateCard
          description={
            selectedSegment === 'board'
              ? '게시판 메인 화면을 준비하고 있습니다.'
              : '채팅 메인 화면을 준비하고 있습니다.'
          }
          icon={null}
          style={styles.placeholderCard}
          title={
            selectedSegment === 'board' ? '게시판 준비 중' : '채팅 준비 중'
          }
        />
      </View>
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

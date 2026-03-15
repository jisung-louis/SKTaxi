import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  NoticeHomeEmptyStateViewData,
  NoticeHomeNoticeItemViewData,
} from '../../model/noticeHomeViewData';
import {NoticeListItemV2} from './NoticeListItemV2';
import {V2StateCard} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface NoticeHomeListProps {
  emptyState: NoticeHomeEmptyStateViewData;
  error: string | null;
  hasMore: boolean;
  items: NoticeHomeNoticeItemViewData[];
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => Promise<void>;
  onPressNotice: (noticeId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  userJoinedAtLoaded: boolean;
}

export const NoticeHomeList = ({
  emptyState,
  error,
  hasMore,
  items,
  loading,
  loadingMore,
  onLoadMore,
  onPressNotice,
  onRefresh,
  refreshing,
  userJoinedAtLoaded,
}: NoticeHomeListProps) => {
  const showLoadingState = loading || !userJoinedAtLoaded;

  return (
    <View style={styles.card}>
      {showLoadingState ? (
        <View style={styles.stateContainer}>
          <V2StateCard
            description="공지사항을 불러오는 중입니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            style={styles.embeddedStateCard}
            title="공지사항 준비 중"
          />
        </View>
      ) : null}

      {!showLoadingState && error ? (
        <View style={styles.stateContainer}>
          <V2StateCard
            actionLabel="새로고침"
            description={error}
            icon={
              <Icon
                color={V2_COLORS.accent.orange}
                name="alert-circle-outline"
                size={28}
              />
            }
            onPressAction={onRefresh}
            style={styles.embeddedStateCard}
            title="공지사항을 불러오지 못했습니다"
          />
        </View>
      ) : null}

      {!showLoadingState && !error && items.length === 0 ? (
        <View style={styles.stateContainer}>
          <V2StateCard
            description={emptyState.description}
            icon={
              <Icon
                color={V2_COLORS.text.muted}
                name="mail-open-outline"
                size={28}
              />
            }
            style={styles.embeddedStateCard}
            title={emptyState.title}
          />
        </View>
      ) : null}

      {!showLoadingState && !error && items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          onEndReached={() => {
            if (hasMore && !loadingMore) {
              onLoadMore().catch(() => undefined);
            }
          }}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshing}
              tintColor={V2_COLORS.brand.primary}
            />
          }
          renderItem={({item, index}) => (
            <NoticeListItemV2
              isLast={index === items.length - 1 && !loadingMore}
              item={item}
              onPress={onPressNotice}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator
                  color={V2_COLORS.brand.primary}
                  size="small"
                />
              </View>
            ) : !hasMore ? (
              <View style={styles.footer}>
                <Text style={styles.footerLabel}>
                  모든 공지사항을 확인했습니다
                </Text>
              </View>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    flex: 1,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
  stateContainer: {
    minHeight: 260,
    padding: V2_SPACING.lg,
  },
  embeddedStateCard: {
    minHeight: '100%',
  },
  footer: {
    alignItems: 'center',
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: V2_SPACING.lg,
  },
  footerLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});

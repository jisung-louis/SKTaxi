import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  NoticeHomeEmptyStateViewData,
  NoticeHomeNoticeItemViewData,
} from '../../model/noticeHomeViewData';
import {NoticeListItem} from './NoticeListItem';
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
  onPressNotice: (noticeId: string) => void;
  onRefresh: () => void;
  userJoinedAtLoaded: boolean;
}

export const NoticeHomeList = ({
  emptyState,
  error,
  hasMore,
  items,
  loading,
  loadingMore,
  onPressNotice,
  onRefresh,
  userJoinedAtLoaded,
}: NoticeHomeListProps) => {
  const showLoadingState = loading || !userJoinedAtLoaded;
  const hasFooter = loadingMore || !hasMore;

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
        <>
          {items.map((item, index) => (
            <NoticeListItem
              key={item.id}
              isLast={index === items.length - 1 && !hasFooter}
              item={item}
              onPress={onPressNotice}
            />
          ))}
          {loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={V2_COLORS.brand.primary} size="small" />
            </View>
          ) : !hasMore ? (
            <View style={styles.footer}>
              <Text style={styles.footerLabel}>
                모든 공지사항을 확인했습니다
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    flexGrow: 1,
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

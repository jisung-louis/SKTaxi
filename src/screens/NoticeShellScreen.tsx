import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  AppHeader,
  CategoryTag,
  type CategoryTagColors,
  type CategoryTagTone,
  ElevatedCard,
  FilterChip,
  UnreadNoticeBanner,
  v2Colors,
  v2Radius,
  v2Spacing,
  v2Typography,
} from '../design-system';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useNotices } from '../hooks/notice';
import { useScreenView } from '../hooks/useScreenView';
import type { NoticeStackParamList, RootStackParamList } from '../navigations/types';
import type { Notice } from '../repositories/interfaces/INoticeRepository';
import { isNoticeRead } from './NoticeTab/utils/noticeReadStatus';

const NOTICE_CATEGORIES = ['전체', '학사', '장학', '취업', '행사', '시설'] as const;

type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NoticeNavigationProp = NativeStackNavigationProp<NoticeStackParamList>;
type NoticePresentationCategory = {
  colors?: CategoryTagColors;
  filter: Exclude<NoticeCategory, '전체'>;
  label: string;
  tone: CategoryTagTone;
};

type NoticePresentationRow = {
  dateLabel: string;
  displayCategory: NoticePresentationCategory;
  notice: Notice;
  unread: boolean;
};

type NoticeContentProps = {
  bottomPadding: number;
  onRetry: () => void;
};

type NoticeStateCardProps = {
  actionLabel?: string;
  description: string;
  onPressAction?: () => void;
  title: string;
};

// `행사` tone is still unresolved in the docs, so keep it neutral until a
// dedicated token is approved.
const UNRESOLVED_EVENT_CATEGORY_COLORS = {
  background: v2Colors.bg.subtle,
  text: v2Colors.text.secondary,
} as const;

const NEUTRAL_CATEGORY_COLORS = {
  background: v2Colors.bg.subtle,
  text: v2Colors.text.secondary,
} as const;

// Figma collapses the legacy notice taxonomy into five faster-scan buckets.
// Keep the raw data source intact and only normalize for the v2 Notice shell.
const RAW_NOTICE_CATEGORY_MAP: Record<string, NoticePresentationCategory> = {
  '공모/행사': { colors: UNRESOLVED_EVENT_CATEGORY_COLORS, filter: '행사', label: '행사', tone: 'custom' },
  '교육/글로벌': { filter: '학사', label: '학사', tone: 'academic' },
  '비교과': { filter: '학사', label: '학사', tone: 'academic' },
  '사회봉사센터': { filter: '시설', label: '시설', tone: 'facility' },
  '생활관': { filter: '시설', label: '시설', tone: 'facility' },
  '새소식': { filter: '학사', label: '학사', tone: 'academic' },
  '시설': { filter: '시설', label: '시설', tone: 'facility' },
  '일반': { filter: '학사', label: '학사', tone: 'academic' },
  '입찰구매정보': { filter: '시설', label: '시설', tone: 'facility' },
  '입학': { filter: '학사', label: '학사', tone: 'academic' },
  '장애학생지원센터': { filter: '시설', label: '시설', tone: 'facility' },
  '장학': { filter: '장학', label: '장학', tone: 'scholarship' },
  '장학/등록/학자금': { filter: '장학', label: '장학', tone: 'scholarship' },
  '취업': { filter: '취업', label: '취업', tone: 'career' },
  '취업/진로개발/창업': { filter: '취업', label: '취업', tone: 'career' },
  '학생': { filter: '학사', label: '학사', tone: 'academic' },
  '학사': { filter: '학사', label: '학사', tone: 'academic' },
  '행사': { colors: UNRESOLVED_EVENT_CATEGORY_COLORS, filter: '행사', label: '행사', tone: 'custom' },
};

const formatNoticeDate = (notice: Notice) => {
  const rawDate = [notice.postedAt, notice.createdAt].find(Boolean);
  const date =
    typeof rawDate?.toDate === 'function'
      ? rawDate.toDate()
      : rawDate instanceof Date
        ? rawDate
        : new Date(typeof rawDate === 'string' || typeof rawDate === 'number' ? rawDate : '');

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveNoticeCategory = (rawCategory: string | undefined): NoticePresentationCategory => {
  const normalizedCategory = rawCategory?.trim() || '일반';
  return RAW_NOTICE_CATEGORY_MAP[normalizedCategory] ?? {
    colors: NEUTRAL_CATEGORY_COLORS,
    filter: '학사',
    label: normalizedCategory,
    tone: 'custom',
  };
};

const renderNoticeCategoryTag = (category: NoticePresentationCategory) => (
  <CategoryTag
    colors={category.tone === 'custom' ? category.colors : undefined}
    label={category.label}
    tone={category.tone}
  />
);

const NoticeStateCard = ({
  actionLabel,
  description,
  onPressAction,
  title,
}: NoticeStateCardProps) => (
  <ElevatedCard padding={0} style={styles.listCard}>
    <View style={styles.stateCardBody}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onPressAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onPressAction}
          style={({ pressed }) => [styles.stateActionButton, pressed && styles.noticeRowPressed]}
        >
          <Text style={styles.stateActionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  </ElevatedCard>
);

const NoticeContent = ({ bottomPadding, onRetry }: NoticeContentProps) => {
  const navigation = useNavigation<NoticeNavigationProp>();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const loadMoreRequestedRef = React.useRef(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<NoticeCategory>('전체');
  const {
    error,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    notices,
    readStatus,
    readStatusLoading,
    refreshReadStatus,
    unreadCount,
    userJoinedAt,
    userJoinedAtLoaded,
  } = useNotices('전체');

  React.useEffect(() => {
    if (!loadingMore) {
      loadMoreRequestedRef.current = false;
    }
  }, [loadingMore]);

  const noticeRows = React.useMemo(
    () =>
      notices.map((notice): NoticePresentationRow => ({
        dateLabel: formatNoticeDate(notice),
        displayCategory: resolveNoticeCategory(notice.category),
        notice,
        unread: !isNoticeRead(notice, readStatus, userJoinedAt),
      })),
    [notices, readStatus, userJoinedAt],
  );

  const filteredRows = React.useMemo(
    () =>
      selectedCategory === '전체'
        ? noticeRows
        : noticeRows.filter(row => row.displayCategory.filter === selectedCategory),
    [noticeRows, selectedCategory],
  );

  React.useEffect(() => {
    if (
      selectedCategory === '전체' ||
      loading ||
      loadingMore ||
      !userJoinedAtLoaded ||
      readStatusLoading ||
      filteredRows.length > 0 ||
      !hasMore ||
      loadMoreRequestedRef.current
    ) {
      return;
    }

    loadMoreRequestedRef.current = true;
    loadMore().catch(() => undefined);
  }, [
    filteredRows.length,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    readStatusLoading,
    selectedCategory,
    userJoinedAtLoaded,
  ]);

  const handleCategoryPress = React.useCallback((category: NoticeCategory) => {
    React.startTransition(() => {
      setSelectedCategory(category);
    });
    scrollViewRef.current?.scrollTo({ animated: true, y: 0 });
  }, []);

  const handleBannerAction = React.useCallback(() => {
    handleCategoryPress('전체');
  }, [handleCategoryPress]);

  const handleNoticePress = React.useCallback(
    (notice: Notice) => {
      markAsRead(notice.id).catch(() => undefined);
      navigation.navigate('NoticeDetail', { noticeId: notice.id });
    },
    [markAsRead, navigation],
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshReadStatus();
    } finally {
      setRefreshing(false);
    }
  }, [refreshReadStatus]);

  const handleScroll = React.useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nearBottom =
        nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
        nativeEvent.contentSize.height - 160;

      if (nearBottom && hasMore && !loadingMore && !loadMoreRequestedRef.current) {
        loadMoreRequestedRef.current = true;
        loadMore().catch(() => undefined);
      }
    },
    [hasMore, loadMore, loadingMore],
  );

  const isInitialLoading = loading || !userJoinedAtLoaded || readStatusLoading;
  const isCategoryLoading = selectedCategory !== '전체' && filteredRows.length === 0 && (hasMore || loadingMore);

  const renderListContent = () => {
    if (isInitialLoading) {
      return (
        <NoticeStateCard
          description="목록 구조를 준비하고 있습니다."
          title="공지사항을 불러오는 중입니다."
        />
      );
    }

    if (error) {
      return (
        <NoticeStateCard
          actionLabel="재시도"
          description="잠시 후 다시 시도해주세요."
          onPressAction={onRetry}
          title="공지사항을 불러오지 못했습니다."
        />
      );
    }

    if (isCategoryLoading) {
      return (
        <NoticeStateCard
          description="선택한 카테고리의 공지를 찾고 있습니다."
          title={`${selectedCategory} 공지를 불러오는 중입니다.`}
        />
      );
    }

    if (filteredRows.length === 0) {
      return (
        <NoticeStateCard
          actionLabel={selectedCategory === '전체' ? undefined : '전체보기'}
          description={
            selectedCategory === '전체'
              ? '새로운 공지가 올라오면 여기에 표시됩니다.'
              : '다른 카테고리 공지를 확인해보세요.'
          }
          onPressAction={
            selectedCategory === '전체' ? undefined : () => handleCategoryPress('전체')
          }
          title={
            selectedCategory === '전체'
              ? '등록된 공지사항이 없습니다.'
              : `${selectedCategory} 공지가 없습니다.`
          }
        />
      );
    }

    return (
      <>
        <ElevatedCard padding={0} style={styles.listCard}>
          {filteredRows.map((row, index) => (
            <Pressable
              accessibilityHint="공지 상세로 이동"
              accessibilityLabel={`${row.unread ? '읽지 않은' : '읽은'} ${row.displayCategory.label} 공지, ${row.dateLabel || '날짜 미상'}, ${row.notice.title}`}
              accessibilityRole="button"
              key={row.notice.id}
              onPress={() => handleNoticePress(row.notice)}
              style={({ pressed }) => [
                styles.noticeRow,
                index < filteredRows.length - 1 && styles.noticeRowDivider,
                pressed && styles.noticeRowPressed,
              ]}
            >
              <View style={styles.noticeRowLeading}>
                {row.unread ? <View style={styles.noticeDot} /> : null}
                <View style={styles.noticeCopy}>
                  <View style={styles.noticeMetaRow}>
                    {renderNoticeCategoryTag(row.displayCategory)}
                    {row.dateLabel ? <Text style={styles.noticeDate}>{row.dateLabel}</Text> : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.noticeTitle, !row.unread && styles.noticeTitleMuted]}
                  >
                    {row.notice.title}
                  </Text>
                </View>
              </View>
              <Icon
                color={v2Colors.text.quaternary}
                name="chevron-forward"
                size={14}
                style={styles.noticeChevron}
              />
            </Pressable>
          ))}
        </ElevatedCard>

        {loadingMore ? (
          <Text style={styles.footerStatusText}>공지사항을 더 불러오는 중입니다.</Text>
        ) : null}
      </>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
      onScroll={handleScroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={v2Colors.accent.green.base}
          onRefresh={() => {
            handleRefresh().catch(() => undefined);
          }}
        />
      }
      ref={scrollViewRef}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <UnreadNoticeBanner
        count={unreadCount}
        onPressAction={handleBannerAction}
        style={styles.banner}
      />

      <View style={styles.filterSection}>
        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {NOTICE_CATEGORIES.map(category => (
            <FilterChip
              key={category}
              label={category}
              onPress={() => handleCategoryPress(category)}
              selected={selectedCategory === category}
            />
          ))}
        </ScrollView>
      </View>

      {renderListContent()}
    </ScrollView>
  );
};

export const NoticeShellScreen = () => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const [retrySeed, setRetrySeed] = React.useState(0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader
        actions={[
          {
            accessibilityLabel: '검색',
            icon: <Icon color={v2Colors.text.primary} name="search-outline" size={20} />,
            onPress: () => undefined,
          },
          {
            accessibilityLabel: 'MY로 이동',
            icon: <Icon color={v2Colors.text.primary} name="person-outline" size={20} />,
            onPress: () => navigation.navigate('My', { screen: 'MyMain' }),
          },
        ]}
        title="공지"
      />
      <NoticeContent
        bottomPadding={BOTTOM_TAB_BAR_HEIGHT + insets.bottom + v2Spacing[6]}
        key={retrySeed}
        onRetry={() => setRetrySeed(seed => seed + 1)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: v2Spacing[4],
    marginTop: v2Spacing[4],
  },
  container: {
    backgroundColor: v2Colors.bg.app,
    flex: 1,
  },
  filterContent: {
    gap: v2Spacing[2],
    paddingHorizontal: v2Spacing[4],
  },
  filterSection: {
    backgroundColor: v2Colors.bg.surface,
    borderBottomColor: v2Colors.border.default,
    borderBottomWidth: 1,
    marginTop: v2Spacing[3],
    paddingBottom: 13,
    paddingTop: 12,
  },
  footerStatusText: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
    marginTop: v2Spacing[3],
    textAlign: 'center',
  },
  listCard: {
    marginHorizontal: v2Spacing[4],
    marginTop: v2Spacing[4],
  },
  noticeChevron: {
    marginTop: 4,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeDate: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
  },
  noticeDot: {
    backgroundColor: v2Colors.status.unread.dot,
    borderRadius: v2Radius.full,
    height: 8,
    marginRight: 12,
    marginTop: 8,
    width: 8,
  },
  noticeMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[2],
    marginBottom: v2Spacing[2],
  },
  noticeRow: {
    alignItems: 'flex-start',
    backgroundColor: v2Colors.bg.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 85,
    paddingHorizontal: v2Spacing[4],
    paddingBottom: 17,
    paddingTop: v2Spacing[4],
  },
  noticeRowDivider: {
    borderBottomColor: v2Colors.border.subtle,
    borderBottomWidth: 1,
  },
  noticeRowLeading: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    marginRight: v2Spacing[3],
  },
  noticeRowPressed: {
    opacity: 0.72,
  },
  noticeTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
  },
  noticeTitleMuted: {
    color: v2Colors.text.secondary,
    fontWeight: '400',
  },
  scrollContent: {
    paddingTop: 0,
  },
  stateActionButton: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.subtle,
    borderRadius: v2Radius.md,
    height: 36,
    justifyContent: 'center',
    marginTop: v2Spacing[4],
    minWidth: 80,
    paddingHorizontal: v2Spacing[4],
  },
  stateActionLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.accent.green.base,
  },
  stateCardBody: {
    alignItems: 'center',
    paddingHorizontal: v2Spacing[5],
    paddingVertical: v2Spacing[6],
  },
  stateDescription: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: v2Spacing[2],
    textAlign: 'center',
  },
  stateTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});

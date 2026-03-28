import React from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {StateCard} from '@/shared/design-system/components';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
import {COLORS, RADIUS, SHADOWS, SPACING} from '@/shared/design-system/tokens';

import {NoticeSearchResultListItem} from '../components/NoticeSearchResultListItem';
import {useNoticeSearchData} from '../hooks/useNoticeSearchData';
import type {NoticeStackParamList} from '../model/navigation';
import {isNoticeRead} from '../model/selectors';
import {
  clearRecentNoticeSearches,
  loadRecentNoticeSearches,
  pushRecentNoticeSearch,
  removeRecentNoticeSearch,
} from '../services/noticeSearchHistoryService';

type NoticeSearchNavigationProp = NativeStackNavigationProp<
  NoticeStackParamList,
  'NoticeSearch'
>;
type NoticeSearchRouteProp = RouteProp<NoticeStackParamList, 'NoticeSearch'>;

const SEARCH_PLACEHOLDER = '공지사항 검색';

export const NoticeSearchScreen = () => {
  useScreenView();

  const navigation = useNavigation<NoticeSearchNavigationProp>();
  const route = useRoute<NoticeSearchRouteProp>();
  const inputRef = React.useRef<TextInput>(null);
  const loadMoreRequestedRef = React.useRef(false);
  const hasScrolledResultsRef = React.useRef(false);
  const screenAnimatedStyle = useScreenEnterAnimation();
  const initialQuery = React.useMemo(
    () => route.params?.initialQuery?.trim() ?? '',
    [route.params?.initialQuery],
  );
  const [inputValue, setInputValue] = React.useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = React.useState(initialQuery);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [historyLoaded, setHistoryLoaded] = React.useState(false);
  const {
    error,
    hasMore,
    items,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    readStatus,
    retry,
    totalCount,
    userJoinedAt,
    userJoinedAtLoaded,
  } = useNoticeSearchData(submittedQuery);
  const insets = useSafeAreaInsets();
  React.useEffect(() => {
    let cancelled = false;

    loadRecentNoticeSearches()
      .then(storedKeywords => {
        if (cancelled) {
          return;
        }

        setRecentSearches(storedKeywords);
        setHistoryLoaded(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setHistoryLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => {
      clearTimeout(focusTimer);
    };
  }, []);

  React.useEffect(() => {
    hasScrolledResultsRef.current = false;
    loadMoreRequestedRef.current = false;
  }, [submittedQuery]);

  React.useEffect(() => {
    if (!loadingMore) {
      loadMoreRequestedRef.current = false;
    }
  }, [items.length, loadingMore]);

  const handleSubmitSearch = React.useCallback(
    async (nextKeyword?: string) => {
      const normalizedKeyword = (nextKeyword ?? inputValue).trim();
      setInputValue(normalizedKeyword);
      setSubmittedQuery(normalizedKeyword);

      if (!normalizedKeyword) {
        return;
      }

      const nextRecentSearches = await pushRecentNoticeSearch(
        normalizedKeyword,
      );
      setRecentSearches(nextRecentSearches);
    },
    [inputValue],
  );

  const handlePressRecentKeyword = React.useCallback(
    (keyword: string) => {
      handleSubmitSearch(keyword).catch(() => undefined);
    },
    [handleSubmitSearch],
  );

  const handleRemoveRecentKeyword = React.useCallback((keyword: string) => {
    removeRecentNoticeSearch(keyword)
      .then(nextRecentSearches => {
        setRecentSearches(nextRecentSearches);
      })
      .catch(() => undefined);
  }, []);

  const handleClearRecentKeywords = React.useCallback(() => {
    clearRecentNoticeSearches()
      .then(() => {
        setRecentSearches([]);
      })
      .catch(() => undefined);
  }, []);

  const handleClearInput = React.useCallback(() => {
    setInputValue('');
    setSubmittedQuery('');
  }, []);

  const handleOpenNotice = React.useCallback(
    (noticeId: string) => {
      markAsRead(noticeId).catch(() => undefined);
      navigation.navigate('NoticeDetail', {noticeId});
    },
    [markAsRead, navigation],
  );

  const handleBeginResultsScroll = React.useCallback(() => {
    hasScrolledResultsRef.current = true;
  }, []);

  const handleScrollResults = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        !submittedQuery ||
        !userJoinedAtLoaded ||
        !hasScrolledResultsRef.current ||
        loading ||
        loadingMore ||
        !hasMore ||
        error ||
        loadMoreRequestedRef.current
      ) {
        return;
      }

      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom > 120) {
        return;
      }

      loadMoreRequestedRef.current = true;
      loadMore().catch(() => {
        loadMoreRequestedRef.current = false;
      });
    },
    [
      error,
      hasMore,
      loadMore,
      loading,
      loadingMore,
      submittedQuery,
      userJoinedAtLoaded,
    ],
  );

  const showRecentSearches =
    !submittedQuery && historyLoaded && recentSearches.length > 0;
  const showInitialEmptyState =
    !submittedQuery && historyLoaded && recentSearches.length === 0;
  const showResultsLoadingState = loading || !userJoinedAtLoaded;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        <View style={[styles.header, {paddingTop: insets.top + SPACING.md}]}>
          <TouchableOpacity
            accessibilityLabel="뒤로 가기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={navigation.goBack}
            style={styles.backButton}>
            <Icon color={COLORS.text.primary} name="chevron-back" size={20} />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <Icon color={COLORS.text.muted} name="search-outline" size={18} />
            <TextInput
              ref={inputRef}
              autoCorrect={false}
              onChangeText={setInputValue}
              onSubmitEditing={() => {
                handleSubmitSearch().catch(() => undefined);
              }}
              placeholder={SEARCH_PLACEHOLDER}
              placeholderTextColor={COLORS.text.muted}
              returnKeyType="search"
              selectionColor={COLORS.brand.primary}
              style={styles.searchInput}
              value={inputValue}
            />
            {inputValue ? (
              <TouchableOpacity
                accessibilityLabel="검색어 지우기"
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={handleClearInput}
                style={styles.clearButton}>
                <Icon color={COLORS.text.muted} name="close-circle" size={18} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {showInitialEmptyState ? (
          <View style={styles.initialEmptyState}>
            <View style={styles.initialEmptyIcon}>
              <Icon
                color={COLORS.brand.primaryAccent}
                name="search-outline"
                size={24}
              />
            </View>
            <Text style={styles.initialEmptyDescription}>
              공지사항 제목과 본문을 검색할 수 있어요
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={handleBeginResultsScroll}
            onScroll={handleScrollResults}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}>
            {showRecentSearches ? (
              <View style={styles.recentCard}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>최근 검색어</Text>
                  <TouchableOpacity
                    accessibilityLabel="최근 검색어 전체 삭제"
                    accessibilityRole="button"
                    activeOpacity={0.82}
                    onPress={handleClearRecentKeywords}>
                    <Text style={styles.recentClearText}>전체 삭제</Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map((keyword, index) => (
                  <View
                    key={keyword}
                    style={[
                      styles.recentRow,
                      index === recentSearches.length - 1
                        ? styles.recentRowLast
                        : null,
                    ]}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.82}
                      onPress={() => handlePressRecentKeyword(keyword)}
                      style={styles.recentKeywordButton}>
                      <Icon
                        color={COLORS.text.muted}
                        name="time-outline"
                        size={16}
                      />
                      <Text style={styles.recentKeywordText}>{keyword}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      accessibilityLabel={`${keyword} 최근 검색어 삭제`}
                      accessibilityRole="button"
                      activeOpacity={0.82}
                      onPress={() => handleRemoveRecentKeyword(keyword)}
                      style={styles.recentDeleteButton}>
                      <Icon color={COLORS.text.muted} name="close" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {submittedQuery ? (
              <>
                <View style={styles.resultSummary}>
                  <Text style={styles.resultSummaryText}>
                    <Text style={styles.resultKeyword}>
                      {`"${submittedQuery}"`}
                    </Text>
                    <Text style={styles.resultSummaryMuted}> 검색 결과 </Text>
                    <Text style={styles.resultCount}>{`${totalCount}건`}</Text>
                  </Text>
                </View>

                <View style={styles.resultsCard}>
                  {showResultsLoadingState ? (
                    <View style={styles.cardStateContainer}>
                      <ActivityIndicator color={COLORS.brand.primary} />
                    </View>
                  ) : null}

                  {!showResultsLoadingState && error ? (
                    <View style={styles.cardStateContainer}>
                      <StateCard
                        actionLabel="다시 시도"
                        description={error}
                        icon={
                          <Icon
                            color={COLORS.accent.orange}
                            name="alert-circle-outline"
                            size={28}
                          />
                        }
                        onPressAction={() => {
                          retry().catch(() => undefined);
                        }}
                        title="검색 결과를 불러오지 못했습니다"
                      />
                    </View>
                  ) : null}

                  {!showResultsLoadingState && !error && items.length === 0 ? (
                    <View style={styles.cardStateContainer}>
                      <StateCard
                        description="다른 검색어로 다시 시도해 주세요."
                        icon={
                          <Icon
                            color={COLORS.text.muted}
                            name="search-outline"
                            size={28}
                          />
                        }
                        title="검색 결과가 없습니다"
                      />
                    </View>
                  ) : null}

                  {!showResultsLoadingState && !error && items.length > 0 ? (
                    <>
                      {items.map((item, index) => (
                        <NoticeSearchResultListItem
                          key={item.id}
                          isLast={
                            index === items.length - 1 &&
                            !loadingMore &&
                            !hasMore
                          }
                          isUnread={
                            !isNoticeRead(item, readStatus, userJoinedAt)
                          }
                          item={item}
                          onPress={handleOpenNotice}
                          query={submittedQuery}
                        />
                      ))}
                      {loadingMore ? (
                        <View style={styles.resultsFooter}>
                          <ActivityIndicator
                            color={COLORS.brand.primary}
                            size="small"
                          />
                        </View>
                      ) : !hasMore ? (
                        <View style={styles.resultsFooter}>
                          <Text style={styles.resultsFooterText}>
                            모든 검색 결과를 확인했습니다
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                </View>
              </>
            ) : null}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 40,
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
  },
  clearButton: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  initialEmptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  initialEmptyIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    width: 56,
  },
  initialEmptyDescription: {
    color: COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.raised,
  },
  recentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  recentTitle: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  recentClearText: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  recentRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: SPACING.lg,
  },
  recentRowLast: {
    borderBottomWidth: 0,
  },
  recentKeywordButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    minHeight: 40,
  },
  recentKeywordText: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
  recentDeleteButton: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  resultSummary: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  resultSummaryText: {
    color: COLORS.text.strong,
    fontSize: 12,
    lineHeight: 16,
  },
  resultKeyword: {
    color: COLORS.brand.primaryStrong,
    fontWeight: '700',
  },
  resultSummaryMuted: {
    color: COLORS.text.muted,
  },
  resultCount: {
    color: COLORS.text.strong,
    fontWeight: '700',
  },
  resultsCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardStateContainer: {
    minHeight: 260,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  resultsFooter: {
    alignItems: 'center',
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
  },
  resultsFooterText: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});

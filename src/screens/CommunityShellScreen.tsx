import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { BoardSearch } from '../components/board/BoardSearch';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import {
  AppHeader,
  ElevatedCard,
  FloatingActionButton,
  StatusBadge,
  TopSegmentTabs,
  v2Colors,
  v2Radius,
  v2Spacing,
  v2Typography,
} from '../design-system';
import { useAuth } from '../hooks/auth';
import { useBoardPosts } from '../hooks/board';
import { useChatRooms, useChatRoomStates } from '../hooks/chat';
import { useScreenView } from '../hooks/useScreenView';
import { shouldHideContent } from '../lib/moderation';
import type { CommunityStackParamList, RootStackParamList } from '../navigations/types';
import type { BoardPost, BoardSearchFilters } from '../types/board';
import type { ChatRoom } from '../types/firestore';

type CommunitySegment = 'board' | 'chat';
type CommunityNavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'CommunityMain'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommunityRouteProp = RouteProp<CommunityStackParamList, 'CommunityMain'>;

type StateCardProps = {
  actionLabel?: string;
  description: string;
  loading?: boolean;
  onPressAction?: () => void;
  title: string;
};

const COMMUNITY_TABS = [
  { key: 'board', label: '게시판' },
  { key: 'chat', label: '채팅' },
] as const;

const DEFAULT_BOARD_FILTERS: BoardSearchFilters = {
  sortBy: 'latest',
};

const FEATURED_GRADIENT_COLORS = [
  v2Colors.accent.orange.soft,
  v2Colors.accent.purple.soft,
] as const;

const BOARD_CATEGORY_LABELS: Record<BoardPost['category'], string> = {
  announcement: '공지사항',
  general: '자유게시판',
  question: '질문게시판',
  review: '정보게시판',
};

const CHAT_ROOM_STYLES = {
  custom: {
    iconColor: v2Colors.accent.purple.base,
    iconName: 'chat-processing-outline',
    softBackground: v2Colors.accent.purple.iconBg,
  },
  department: {
    iconColor: v2Colors.accent.blue.base,
    iconName: 'account-group-outline',
    softBackground: v2Colors.accent.blue.soft,
  },
  game: {
    iconColor: v2Colors.accent.orange.base,
    iconName: 'gamepad-variant-outline',
    softBackground: v2Colors.accent.orange.soft,
  },
  university: {
    iconColor: v2Colors.accent.green.strong,
    iconName: 'office-building-outline',
    softBackground: v2Colors.accent.green.soft,
  },
} as const;

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    const converted = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(converted.getTime()) ? null : converted;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const converted = new Date(value);
    return Number.isNaN(converted.getTime()) ? null : converted;
  }

  return null;
};

const toMillis = (value: unknown): number | null => {
  const date = toDate(value);
  return date ? date.getTime() : null;
};

const formatKoreanDateTime = (value: unknown, includeDate: boolean): string => {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 || 12;
  const timeLabel = `${period} ${hour12}:${minutes}`;

  return includeDate ? `${month}월 ${day}일 ${timeLabel}` : timeLabel;
};

const formatRelativeTime = (value: unknown): string => {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return formatKoreanDateTime(date, true);
};

const formatChatMemberCount = (count: number) =>
  `${new Intl.NumberFormat('ko-KR').format(count)}명`;

const resolveBoardCategoryLabel = (category: BoardPost['category']) =>
  BOARD_CATEGORY_LABELS[category] ?? '자유게시판';

const resolveChatUnreadCount = (
  room: ChatRoom,
  userId: string | undefined,
  lastReadAt: unknown,
) => {
  if (userId) {
    const explicitUnread = room.unreadCount?.[userId];
    if (typeof explicitUnread === 'number' && explicitUnread > 0) {
      return explicitUnread;
    }
  }

  const lastMessageMillis = toMillis(room.lastMessage?.timestamp);
  if (!lastMessageMillis) {
    return 0;
  }

  const lastReadMillis = toMillis(lastReadAt);
  return lastReadMillis === null || lastMessageMillis > lastReadMillis ? 1 : 0;
};

const useModeratedBoardPosts = (filters: BoardSearchFilters) => {
  const boardState = useBoardPosts(filters);
  const [visiblePosts, setVisiblePosts] = React.useState<BoardPost[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    if (boardState.posts.length === 0) {
      setVisiblePosts([]);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const decisions = await Promise.all(
          boardState.posts.map(async post => ({
            hidden: await shouldHideContent(post.authorId),
            post,
          })),
        );

        if (!cancelled) {
          setVisiblePosts(decisions.filter(result => !result.hidden).map(result => result.post));
        }
      } catch {
        if (!cancelled) {
          setVisiblePosts(boardState.posts);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardState.posts]);

  return {
    ...boardState,
    posts: visiblePosts,
  };
};

const CommunityStateCard = ({
  actionLabel,
  description,
  loading = false,
  onPressAction,
  title,
}: StateCardProps) => (
  <ElevatedCard style={styles.stateCard}>
    {loading ? (
      <ActivityIndicator color={v2Colors.accent.green.base} size="small" style={styles.stateSpinner} />
    ) : null}
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateDescription}>{description}</Text>
    {actionLabel && onPressAction ? (
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onPressAction}
        style={({ pressed }) => [styles.stateActionButton, pressed && styles.pressed]}
      >
        <Text style={styles.stateActionLabel}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </ElevatedCard>
);

const ListSpacer = () => <View style={styles.listSpacer} />;

const BoardSegmentContent = ({
  bottomPadding,
  filters,
  onClearSearchText,
  onOpenPost,
}: {
  bottomPadding: number;
  filters: BoardSearchFilters;
  onClearSearchText: () => void;
  onOpenPost: (postId: string) => void;
}) => {
  const featuredState = useModeratedBoardPosts({ ...filters, sortBy: 'popular' });
  const feedState = useModeratedBoardPosts(filters);

  const featuredPost = featuredState.posts[0] ?? null;
  const feedPosts = React.useMemo(
    () => feedState.posts.filter(post => post.id !== featuredPost?.id),
    [feedState.posts, featuredPost?.id],
  );

  const boardError = feedState.error || featuredState.error;
  const boardLoading =
    feedState.loading &&
    feedState.posts.length === 0 &&
    featuredState.loading &&
    featuredState.posts.length === 0;
  const showSearchResult = Boolean(filters.searchText);

  const handleLoadMore = React.useCallback(() => {
    feedState.loadMore().catch(() => undefined);
  }, [feedState]);

  const renderFeedCard = React.useCallback(
    ({ item }: { item: BoardPost }) => (
      <ElevatedCard
        accessibilityLabel={item.title}
        onPress={() => onOpenPost(item.id)}
        style={styles.feedCard}
      >
        <View style={styles.feedMetaRow}>
          <View style={styles.feedTag}>
            <Text style={styles.feedTagLabel}>{resolveBoardCategoryLabel(item.category)}</Text>
          </View>
          <Text style={styles.feedTime}>{formatKoreanDateTime(item.createdAt, true)}</Text>
        </View>

        <Text numberOfLines={1} style={styles.feedTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.feedBody}>
          {item.content}
        </Text>

        <View style={styles.feedFooter}>
          <Text style={styles.feedAuthor}>{item.isAnonymous ? '익명' : item.authorName}</Text>
          <View style={styles.feedMetrics}>
            <View style={styles.metricItem}>
              <Icon color={v2Colors.accent.red.base} name="heart-outline" size={12} />
              <Text style={[styles.metricLabel, styles.metricHeartLabel]}>{item.likeCount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon color={v2Colors.text.secondary} name="chatbubble-outline" size={12} />
              <Text style={styles.metricLabel}>{item.commentCount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon color={v2Colors.accent.green.strong} name="bookmark-outline" size={12} />
              <Text style={[styles.metricLabel, styles.metricBookmarkLabel]}>
                {item.bookmarkCount}
              </Text>
            </View>
          </View>
        </View>
      </ElevatedCard>
    ),
    [onOpenPost],
  );

  if (boardLoading) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          description="게시글과 인기 항목을 불러오는 중입니다."
          loading
          title="커뮤니티를 준비하고 있습니다"
        />
      </View>
    );
  }

  if (boardError && !featuredPost && feedPosts.length === 0) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          actionLabel="다시 시도"
          description={boardError}
          onPressAction={feedState.refresh}
          title="게시글을 불러오지 못했습니다"
        />
      </View>
    );
  }

  if (!featuredPost && feedPosts.length === 0) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          actionLabel={showSearchResult ? '검색 지우기' : undefined}
          description={
            showSearchResult
              ? '검색 조건에 맞는 게시글이 없습니다.'
              : '아직 표시할 게시글이 없습니다. 첫 글을 작성해보세요.'
          }
          onPressAction={showSearchResult ? onClearSearchText : undefined}
          title={showSearchResult ? '검색 결과가 없습니다' : '게시글이 없습니다'}
        />
      </View>
    );
  }

  return (
    <FlatList
      ItemSeparatorComponent={ListSpacer}
      ListFooterComponent={
        feedState.loadingMore ? (
          <ActivityIndicator color={v2Colors.accent.green.base} size="small" style={styles.loadingMore} />
        ) : null
      }
      ListHeaderComponent={
        <View>
          {showSearchResult ? (
            <ElevatedCard style={styles.searchResultCard}>
              <View style={styles.searchResultHeader}>
                <Text style={styles.searchResultLabel}>
                  {filters.searchText?.startsWith('#')
                    ? `${filters.searchText} 해시태그 검색 결과`
                    : `"${filters.searchText}" 검색 결과`}
                </Text>
                <Pressable
                  accessibilityLabel="검색 지우기"
                  accessibilityRole="button"
                  onPress={onClearSearchText}
                  style={({ pressed }) => [styles.clearSearchButton, pressed && styles.pressed]}
                >
                  <Text style={styles.clearSearchLabel}>지우기</Text>
                </Pressable>
              </View>
            </ElevatedCard>
          ) : null}

          {featuredPost ? (
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>🔥 인기 게시글</Text>

              <LinearGradient
                colors={FEATURED_GRADIENT_COLORS}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.featuredCard}
              >
                <Pressable
                  accessibilityLabel={featuredPost.title}
                  accessibilityRole="button"
                  onPress={() => onOpenPost(featuredPost.id)}
                  style={({ pressed }) => [styles.featuredContent, pressed && styles.pressed]}
                >
                  <View style={styles.featuredMetaRow}>
                    <View style={styles.featuredTag}>
                      <Text style={styles.featuredTagLabel}>
                        {resolveBoardCategoryLabel(featuredPost.category)}
                      </Text>
                    </View>
                    <Text style={styles.featuredTime}>{formatRelativeTime(featuredPost.createdAt)}</Text>
                  </View>

                  <Text numberOfLines={1} style={styles.featuredTitle}>
                    {featuredPost.title}
                  </Text>

                  <View style={styles.featuredMetricRow}>
                    <View style={styles.metricItem}>
                      <Icon color={v2Colors.text.secondary} name="heart-outline" size={12} />
                      <Text style={styles.metricLabel}>{featuredPost.likeCount}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon color={v2Colors.text.secondary} name="chatbubble-outline" size={12} />
                      <Text style={styles.metricLabel}>{featuredPost.commentCount}</Text>
                    </View>
                  </View>
                </Pressable>
              </LinearGradient>
            </View>
          ) : null}
        </View>
      }
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
      data={feedPosts}
      keyExtractor={item => item.id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.45}
      renderItem={renderFeedCard}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ChatSegmentContent = ({
  bottomPadding,
  onOpenChat,
  onRetry,
}: {
  bottomPadding: number;
  onOpenChat: (chatRoomId: string) => void;
  onRetry: () => void;
}) => {
  const { user } = useAuth();
  const { states: chatRoomStates, error: chatStateError, loading: chatStateLoading } =
    useChatRoomStates();
  const universityState = useChatRooms('university');
  const departmentState = useChatRooms('department');
  const customState = useChatRooms('custom');

  const chatLoading =
    chatStateLoading ||
    universityState.loading ||
    departmentState.loading ||
    customState.loading;
  const chatError =
    (chatStateError as string | null) ||
    (typeof universityState.error === 'string' ? universityState.error : null) ||
    (typeof departmentState.error === 'string' ? departmentState.error : null) ||
    (typeof customState.error === 'string' ? customState.error : null);

  const chatRooms = React.useMemo(() => {
    const roomMap = new Map<string, ChatRoom>();
    const candidateRooms = [
      ...universityState.chatRooms,
      ...departmentState.chatRooms,
      ...customState.chatRooms.filter(room => room.isPublic),
    ];

    candidateRooms.forEach(room => {
      if (!room.id) {
        return;
      }

      roomMap.set(room.id, room);
    });

    return Array.from(roomMap.values()).sort((left, right) => {
      const typeRank = { university: 0, department: 1, custom: 2, game: 3 } as const;
      const leftRank = typeRank[left.type] ?? 4;
      const rightRank = typeRank[right.type] ?? 4;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return (toMillis(right.updatedAt) ?? 0) - (toMillis(left.updatedAt) ?? 0);
    });
  }, [customState.chatRooms, departmentState.chatRooms, universityState.chatRooms]);

  const renderChatRoom = React.useCallback(
    ({ item }: { item: ChatRoom }) => {
      const roomStyle = CHAT_ROOM_STYLES[item.type] ?? CHAT_ROOM_STYLES.custom;
      const unreadCount = resolveChatUnreadCount(
        item,
        user?.uid,
        item.id ? chatRoomStates[item.id]?.lastReadAt : undefined,
      );

      return (
        <ElevatedCard
          accessibilityLabel={item.name}
          onPress={() => {
            if (item.id) {
              onOpenChat(item.id);
            }
          }}
          style={styles.chatCard}
        >
          <View style={[styles.chatAvatar, { backgroundColor: roomStyle.softBackground }]}>
            <MaterialCommunityIcons
              color={roomStyle.iconColor}
              name={roomStyle.iconName}
              size={20}
            />
          </View>

          <View style={styles.chatCopy}>
            <View style={styles.chatMetaRow}>
              <Text numberOfLines={1} style={styles.chatTitle}>
                {item.name}
              </Text>
              <Text style={styles.chatTime}>
                {formatKoreanDateTime(item.lastMessage?.timestamp ?? item.updatedAt, false)}
              </Text>
            </View>

            <View style={styles.chatMessageRow}>
              <Text numberOfLines={1} style={styles.chatMessage}>
                {item.lastMessage?.text ?? item.description ?? '아직 메시지가 없어요'}
              </Text>
              {unreadCount > 0 ? (
                <StatusBadge
                  accessibilityLabel={`안 읽은 메시지 ${unreadCount}개`}
                  value={`${unreadCount}`}
                  variant="count"
                />
              ) : null}
            </View>

            <Text style={styles.chatUsers}>{formatChatMemberCount(item.members.length)}</Text>
          </View>
        </ElevatedCard>
      );
    },
    [chatRoomStates, onOpenChat, user?.uid],
  );

  if (chatLoading && chatRooms.length === 0) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          description="채팅방 목록을 불러오는 중입니다."
          loading
          title="공개 채팅방을 준비하고 있습니다"
        />
      </View>
    );
  }

  if (chatError && chatRooms.length === 0) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          actionLabel="다시 시도"
          description={chatError}
          onPressAction={onRetry}
          title="채팅방을 불러오지 못했습니다"
        />
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View style={[styles.stateContainer, { paddingBottom: bottomPadding }]}>
        <CommunityStateCard
          description="참여 중인 공개 채팅방이 아직 없습니다."
          title="표시할 채팅방이 없습니다"
        />
      </View>
    );
  }

  return (
    <FlatList
      ItemSeparatorComponent={ListSpacer}
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
      data={chatRooms}
      keyExtractor={item => item.id ?? item.name}
      renderItem={renderChatRoom}
      showsVerticalScrollIndicator={false}
    />
  );
};

export const CommunityShellScreen = () => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const communityNavigation = useNavigation<CommunityNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<CommunityRouteProp>();
  const [segment, setSegment] = React.useState<CommunitySegment>('board');
  const [boardFilters, setBoardFilters] = React.useState<BoardSearchFilters>(DEFAULT_BOARD_FILTERS);
  const [boardSearchVisible, setBoardSearchVisible] = React.useState(false);
  const [chatRetrySeed, setChatRetrySeed] = React.useState(0);

  React.useEffect(() => {
    if (!route.params?.searchText || !route.params.fromHashtag) {
      return;
    }

    React.startTransition(() => {
      setSegment('board');
      setBoardFilters(prev => ({
        ...prev,
        searchText: route.params?.searchText,
      }));
    });

    communityNavigation.setParams({
      fromHashtag: undefined,
      searchText: undefined,
    });
  }, [communityNavigation, route.params?.fromHashtag, route.params?.searchText]);

  const handleSegmentSelect = React.useCallback((key: string) => {
    React.startTransition(() => {
      setSegment(key as CommunitySegment);
    });
  }, []);

  const handleSearchPress = React.useCallback(() => {
    React.startTransition(() => {
      setSegment('board');
    });
    setBoardSearchVisible(true);
  }, []);

  const handleBoardSearch = React.useCallback((filters: BoardSearchFilters) => {
    React.startTransition(() => {
      setSegment('board');
      setBoardFilters(filters);
    });
  }, []);

  const handleClearSearchText = React.useCallback(() => {
    React.startTransition(() => {
      setBoardFilters(prev => ({
        ...prev,
        searchText: undefined,
      }));
    });
  }, []);

  const handleOpenPost = React.useCallback(
    (postId: string) => {
      communityNavigation.navigate('BoardDetail', { postId });
    },
    [communityNavigation],
  );

  const handleOpenChat = React.useCallback(
    (chatRoomId: string) => {
      communityNavigation.navigate('ChatDetail', { chatRoomId });
    },
    [communityNavigation],
  );

  const handleOpenWrite = React.useCallback(() => {
    communityNavigation.navigate('BoardWrite');
  }, [communityNavigation]);

  const listBottomPadding =
    BOTTOM_TAB_BAR_HEIGHT + insets.bottom + (segment === 'board' ? 88 : v2Spacing[6]);
  const fabBottom = BOTTOM_TAB_BAR_HEIGHT + insets.bottom + v2Spacing[4];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader
        actions={[
          {
            accessibilityLabel: '검색',
            icon: <Icon color={v2Colors.text.primary} name="search-outline" size={20} />,
            onPress: handleSearchPress,
          },
          {
            accessibilityLabel: 'MY로 이동',
            icon: <Icon color={v2Colors.text.primary} name="person-outline" size={20} />,
            onPress: () => rootNavigation.navigate('My', { screen: 'MyMain' }),
          },
        ]}
        title="커뮤니티"
      />

      <TopSegmentTabs
        onSelect={handleSegmentSelect}
        options={COMMUNITY_TABS}
        selectedKey={segment}
      />

      {segment === 'board' ? (
        <BoardSegmentContent
          bottomPadding={listBottomPadding}
          filters={boardFilters}
          onClearSearchText={handleClearSearchText}
          onOpenPost={handleOpenPost}
        />
      ) : (
        <ChatSegmentContent
          bottomPadding={listBottomPadding}
          key={chatRetrySeed}
          onOpenChat={handleOpenChat}
          onRetry={() => setChatRetrySeed(prev => prev + 1)}
        />
      )}

      {segment === 'board' ? (
        <FloatingActionButton
          accessibilityLabel="글쓰기"
          icon={<Icon color={v2Colors.text.inverse} name="pencil-outline" size={24} />}
          onPress={handleOpenWrite}
          style={[styles.fab, { bottom: fabBottom }]}
        />
      ) : null}

      <BoardSearch
        currentFilters={boardFilters}
        onClose={() => setBoardSearchVisible(false)}
        onSearch={handleBoardSearch}
        visible={boardSearchVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chatAvatar: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  chatCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[3],
    minHeight: 96,
    padding: v2Spacing[4],
  },
  chatCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  chatMessage: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    flex: 1,
    marginRight: v2Spacing[2],
  },
  chatMessageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTime: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginLeft: v2Spacing[3],
  },
  chatTitle: {
    ...v2Typography.title.card,
    color: v2Colors.text.primary,
    flex: 1,
  },
  chatUsers: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginTop: 4,
  },
  clearSearchButton: {
    borderRadius: v2Radius.md,
    paddingHorizontal: v2Spacing[2],
    paddingVertical: 4,
  },
  clearSearchLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.green.strong,
  },
  container: {
    backgroundColor: v2Colors.bg.app,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: v2Spacing[4],
  },
  featuredCard: {
    borderColor: v2Colors.accent.orange.soft,
    borderRadius: v2Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredContent: {
    padding: 17,
  },
  featuredMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[3],
    marginTop: v2Spacing[2],
  },
  featuredSection: {
    marginBottom: v2Spacing[4],
  },
  featuredTag: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    borderRadius: v2Radius.sm,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  featuredTagLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.orange.base,
  },
  featuredTime: {
    ...v2Typography.meta.default,
    color: v2Colors.text.tertiary,
  },
  featuredTitle: {
    ...v2Typography.title.card,
    color: v2Colors.text.primary,
    marginTop: v2Spacing[2],
  },
  feedAuthor: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
  },
  feedBody: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: 4,
  },
  feedCard: {
    padding: v2Spacing[4],
  },
  feedFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: v2Spacing[3],
  },
  feedMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedMetrics: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[3],
  },
  feedTag: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.subtle,
    borderRadius: v2Radius.sm,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  feedTagLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.text.secondary,
  },
  feedTime: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginLeft: v2Spacing[3],
  },
  feedTitle: {
    ...v2Typography.title.card,
    color: v2Colors.text.primary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: v2Spacing[4],
    paddingTop: v2Spacing[4],
  },
  listSpacer: {
    height: v2Spacing[3],
  },
  loadingMore: {
    marginBottom: v2Spacing[3],
    marginTop: v2Spacing[4],
  },
  metricBookmarkLabel: {
    color: v2Colors.accent.green.strong,
  },
  metricHeartLabel: {
    color: v2Colors.accent.red.base,
  },
  metricItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metricLabel: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
  },
  pressed: {
    opacity: 0.72,
  },
  searchResultCard: {
    marginBottom: v2Spacing[4],
    padding: v2Spacing[3],
  },
  searchResultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchResultLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    flex: 1,
    marginRight: v2Spacing[3],
  },
  sectionTitle: {
    ...v2Typography.title.section,
    color: v2Colors.text.primary,
    marginBottom: v2Spacing[3],
  },
  stateActionButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: v2Colors.accent.green.surface,
    borderRadius: v2Radius.md,
    marginTop: v2Spacing[4],
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateActionLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.green.strong,
  },
  stateCard: {
    padding: v2Spacing[4],
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: v2Spacing[4],
    paddingTop: v2Spacing[4],
  },
  stateDescription: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: 4,
  },
  stateSpinner: {
    alignSelf: 'flex-start',
    marginBottom: v2Spacing[3],
  },
  stateTitle: {
    ...v2Typography.title.card,
    color: v2Colors.text.primary,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';

import {
  DetailBackHeader,
  DetailBodyBlocks,
  DetailCommentCard,
  DetailComposer,
  DetailNotFoundState,
  DetailReactionChip,
  StateCard,
  ToneBadge,
} from '@/shared/design-system/components';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';
import {
  useKeyboardInset,
  useScreenEnterAnimation,
  useScreenView,
} from '@/shared/hooks';

import {BoardDetailPopupMenu} from '../components/BoardDetailPopupMenu';
import {useBoardDetailData} from '../hooks/useBoardDetailData';
import type {BoardStackParamList} from '../model/navigation';

type BoardDetailNavigationProp = NativeStackNavigationProp<
  BoardStackParamList,
  'BoardDetail'
>;

export const BoardDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<BoardDetailNavigationProp>();
  const route =
    useRoute<
      NativeStackScreenProps<BoardStackParamList, 'BoardDetail'>['route']
    >();
  const insets = useSafeAreaInsets();
  const {height: keyboardHeight, isVisible: isKeyboardVisible} =
    useKeyboardInset();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const {
    canManageActions,
    commentDraft,
    data,
    deletePost,
    deletingPost,
    error,
    loading,
    notFound,
    post,
    reload,
    setCommentDraft,
    submitComment,
    submittingComment,
    toggleBookmark,
    toggleLike,
    togglingBookmark,
    togglingLike,
  } = useBoardDetailData(route.params?.postId);

  const headerOffset = insets.top + 56;
  const scrollBottomPadding = isKeyboardVisible
    ? keyboardHeight + 88 + insets.bottom
    : 88;

  const handlePressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('BoardMain');
  }, [navigation]);

  const handlePressReturnToList = React.useCallback(() => {
    navigation.navigate('BoardMain');
  }, [navigation]);

  const handlePressReport = React.useCallback(() => {
    Alert.alert('게시글 신고', '신고 기능은 다음 단계에서 연결할 예정입니다.');
  }, []);

  const handlePressEdit = React.useCallback(() => {
    if (route.params?.postId) {
      navigation.navigate('BoardEdit', {postId: route.params.postId});
      return;
    }

    Alert.alert('게시글 수정', '수정할 게시글 정보를 찾지 못했습니다.');
  }, [navigation, route.params?.postId]);

  const handlePressDelete = React.useCallback(() => {
    Alert.alert('게시글 삭제', '이 게시글을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deletePost()
            .then(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'BoardMain'}],
              });
            })
            .catch(deleteError => {
              Alert.alert(
                '오류',
                deleteError instanceof Error
                  ? deleteError.message
                  : '게시글 삭제에 실패했습니다.',
              );
            });
        },
      },
    ]);
  }, [deletePost, navigation]);

  const handleToggleLike = React.useCallback(() => {
    toggleLike().catch(toggleError => {
      Alert.alert(
        '오류',
        toggleError instanceof Error
          ? toggleError.message
          : '좋아요 처리에 실패했습니다.',
      );
    });
  }, [toggleLike]);

  const handleToggleBookmark = React.useCallback(() => {
    toggleBookmark().catch(toggleError => {
      Alert.alert(
        '오류',
        toggleError instanceof Error
          ? toggleError.message
          : '북마크 처리에 실패했습니다.',
      );
    });
  }, [toggleBookmark]);

  const handleSubmitComment = React.useCallback(() => {
    submitComment().catch(submitError => {
      Alert.alert(
        '오류',
        submitError instanceof Error
          ? submitError.message
          : '댓글 작성에 실패했습니다.',
      );
    });
  }, [submitComment]);

  const categoryBadge = data?.metaBadges[0];
  const rightAccessory = data ? (
    <TouchableOpacity
      accessibilityLabel="게시물 메뉴"
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={() => {
        setIsMenuVisible(previous => !previous);
      }}
      style={styles.menuButton}>
      <Icon
        color={COLORS.text.secondary}
        name="ellipsis-vertical"
        size={18}
      />
    </TouchableOpacity>
  ) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {loading ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <ActivityIndicator color={COLORS.brand.primary} size="large" />
          </View>
        ) : notFound ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <DetailNotFoundState
              actionLabel="목록으로 돌아가기"
              onPressAction={handlePressReturnToList}
              title="게시물을 찾을 수 없어요"
            />
          </View>
        ) : error ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
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
                reload().catch(() => undefined);
              }}
              title="게시물을 불러오지 못했습니다"
            />
          </View>
        ) : data ? (
          <>
            <ScrollView
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: scrollBottomPadding,
                  paddingTop: headerOffset,
                },
              ]}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => {
                if (isMenuVisible) {
                  setIsMenuVisible(false);
                }
              }}
              showsVerticalScrollIndicator={false}>
              <View style={styles.metaRow}>
                {categoryBadge ? (
                  <ToneBadge
                    label={categoryBadge.label}
                    tone={categoryBadge.tone}
                  />
                ) : null}
                <Text style={styles.dateLabel}>{data.dateLabel}</Text>
              </View>

              <Text style={styles.title}>{data.title}</Text>

              {data.authorLabel ? (
                <View style={styles.authorRow}>
                  <View style={styles.avatarCircle}>
                    <Icon
                      color={COLORS.text.muted}
                      name="person-outline"
                      size={14}
                    />
                  </View>
                  <Text style={styles.authorLabel}>{data.authorLabel}</Text>
                </View>
              ) : null}

              <View style={styles.divider} />
              <DetailBodyBlocks blocks={data.bodyBlocks} />

              <View style={styles.reactionsRow}>
                <DetailReactionChip
                  accessibilityLabel="게시글 좋아요"
                  active={Boolean(post?.isLiked)}
                  count={post?.likeCount ?? 0}
                  disabled={togglingLike}
                  iconName={post?.isLiked ? 'heart' : 'heart-outline'}
                  onPress={handleToggleLike}
                />
                <DetailReactionChip
                  accessibilityLabel="게시글 북마크"
                  active={Boolean(post?.isBookmarked)}
                  count={post?.bookmarkCount ?? 0}
                  disabled={togglingBookmark}
                  iconName={post?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  onPress={handleToggleBookmark}
                />
              </View>

              <View style={[styles.divider, styles.commentsDivider]} />
              <Text style={styles.commentsTitle}>댓글 {data.comments.length}</Text>

              {data.comments.length === 0 ? (
                <View style={styles.emptyCommentsWrap}>
                  <Text style={styles.emptyCommentsLabel}>
                    {data.emptyCommentsLabel}
                  </Text>
                </View>
              ) : (
                <View style={styles.commentsList}>
                  {data.comments.map(comment => (
                    <DetailCommentCard comment={comment} key={comment.id} />
                  ))}
                </View>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
              pointerEvents="box-none"
              style={styles.composerAvoidingView}>
              <DetailComposer
                onChangeText={setCommentDraft}
                onSend={handleSubmitComment}
                placeholder={data.commentInputPlaceholder}
                sendEnabled={!submittingComment && commentDraft.trim().length > 0}
                value={commentDraft}
              />
            </KeyboardAvoidingView>
          </>
        ) : null}

        <DetailBackHeader
          onPressBack={handlePressBack}
          rightAccessory={rightAccessory}
        />
        <BoardDetailPopupMenu
          onClose={() => {
            setIsMenuVisible(false);
          }}
          onPressDelete={handlePressDelete}
          onPressEdit={handlePressEdit}
          onPressReport={handlePressReport}
          right={12}
          showManageActions={canManageActions}
          top={insets.top + 44}
          visible={isMenuVisible && !deletingPost}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authorLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  centeredState: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  commentsDivider: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  commentsList: {
    paddingBottom: SPACING.md,
  },
  commentsTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  composerAvoidingView: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginBottom: SPACING.xl,
  },
  emptyCommentsLabel: {
    color: COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCommentsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    paddingVertical: 32,
  },
  menuButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: -6,
    width: 36,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
});

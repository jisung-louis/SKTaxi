import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  DetailTitleHeader,
  StateCard,
} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
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
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    cancelCommentEdit,
    cancelCommentReply,
    canManageActions,
    commentDraft,
    commentLikePendingIds,
    commentItems,
    data,
    deletePost,
    deletingPost,
    editingCommentId,
    error,
    isEditingComment,
    isReplyingComment,
    loading,
    notFound,
    post,
    reload,
    replyTargetLabel,
    setCommentDraft,
    startEditingComment,
    startReplyingComment,
    submitComment,
    submittingComment,
    toggleCommentLike,
    toggleBookmark,
    toggleLike,
    togglingBookmark,
    togglingLike,
  } = useBoardDetailData(route.params?.postId);

  const headerOffset = insets.top + 56;
  const scrollBottomPadding = isKeyboardVisible
    ? keyboardHeight + 88 + insets.bottom
    : 88;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const composerRef = React.useRef<TextInput>(null);
  const commentOffsetMapRef = React.useRef(new Map<string, number>());
  const pendingScrollCommentIdRef = React.useRef<string | null>(null);

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

  const handleToggleCommentLike = React.useCallback(
    (commentId: string) => {
      toggleCommentLike(commentId).catch(toggleError => {
        Alert.alert(
          '오류',
          toggleError instanceof Error
            ? toggleError.message
            : '댓글 좋아요 처리에 실패했습니다.',
        );
      });
    },
    [toggleCommentLike],
  );

  const handleSubmitComment = React.useCallback(() => {
    submitComment()
      .then(result => {
        const targetCommentId = result?.commentId;

        composerRef.current?.blur();
        Keyboard.dismiss();

        if (!targetCommentId) {
          return;
        }

        pendingScrollCommentIdRef.current = targetCommentId;

        setTimeout(() => {
          const commentOffset = commentOffsetMapRef.current.get(targetCommentId);

          if (commentOffset == null) {
            return;
          }

          pendingScrollCommentIdRef.current = null;
          scrollViewRef.current?.scrollTo({
            animated: true,
            y: Math.max(0, commentOffset - headerOffset - SPACING.md),
          });
        }, Platform.OS === 'ios' ? 220 : 120);
      })
      .catch(submitError => {
        Alert.alert(
          '오류',
          submitError instanceof Error
            ? submitError.message
            : isEditingComment
            ? '댓글 수정에 실패했습니다.'
            : isReplyingComment
            ? '답글 작성에 실패했습니다.'
            : '댓글 작성에 실패했습니다.',
        );
      });
  }, [headerOffset, isEditingComment, isReplyingComment, submitComment]);

  const handleStartEditingComment = React.useCallback(
    (commentId: string) => {
      startEditingComment(commentId);
      setTimeout(() => {
        composerRef.current?.focus();
      }, 40);
    },
    [startEditingComment],
  );

  const handleStartReplyingComment = React.useCallback(
    (commentId: string) => {
      startReplyingComment(commentId);
      setTimeout(() => {
        composerRef.current?.focus();
      }, 40);
    },
    [startReplyingComment],
  );

  const handleCancelCommentEdit = React.useCallback(() => {
    cancelCommentEdit();
    composerRef.current?.blur();
    Keyboard.dismiss();
  }, [cancelCommentEdit]);

  const handleCancelCommentReply = React.useCallback(() => {
    cancelCommentReply();
  }, [cancelCommentReply]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);

    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const handleCommentLayout = React.useCallback(
    (commentId: string, event: LayoutChangeEvent) => {
      const nextOffset = event.nativeEvent.layout.y;
      commentOffsetMapRef.current.set(commentId, nextOffset);

      if (pendingScrollCommentIdRef.current !== commentId) {
        return;
      }

      pendingScrollCommentIdRef.current = null;
      scrollViewRef.current?.scrollTo({
        animated: true,
        y: Math.max(0, nextOffset - headerOffset - SPACING.md),
      });
    },
    [headerOffset],
  );

  const rightAccessory = data ? (
    <TouchableOpacity
      accessibilityLabel="게시물 메뉴"
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={() => {
        setIsMenuVisible(previous => !previous);
      }}
      style={styles.menuButton}>
      <Icon color={COLORS.text.secondary} name="ellipsis-vertical" size={18} />
    </TouchableOpacity>
  ) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {loading && !data ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <ActivityIndicator color={COLORS.brand.primary} size="large" />
          </View>
        ) : notFound && !data ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <DetailNotFoundState
              actionLabel="목록으로 돌아가기"
              onPressAction={handlePressReturnToList}
              title="게시물을 찾을 수 없어요"
            />
          </View>
        ) : error && !data ? (
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
              ref={scrollViewRef}
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: scrollBottomPadding,
                  paddingTop: headerOffset,
                },
              ]}
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => {
                if (isMenuVisible) {
                  setIsMenuVisible(false);
                }
              }}
              refreshControl={
                <RefreshControl
                  onRefresh={handleRefresh}
                  progressViewOffset={headerOffset}
                  refreshing={refreshing}
                  tintColor={COLORS.brand.primary}
                />
              }
              showsVerticalScrollIndicator={false}>
              <DetailTitleHeader
                authorLabel={data.authorLabel}
                badges={data.metaBadges}
                dateLabel={data.dateLabel}
                title={data.title}
                viewCountLabel={data.viewCountLabel}
              />
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
                  iconName={
                    post?.isBookmarked ? 'bookmark' : 'bookmark-outline'
                  }
                  onPress={handleToggleBookmark}
                />
              </View>

              <View style={[styles.divider, styles.commentsDivider]} />
              <Text style={styles.commentsTitle}>
                댓글 {commentItems.length}
              </Text>

              {commentItems.length === 0 ? (
                <View style={styles.emptyCommentsWrap}>
                  <Text style={styles.emptyCommentsLabel}>
                    {data.emptyCommentsLabel}
                  </Text>
                </View>
              ) : (
                <View style={styles.commentsList}>
                  {commentItems.map(comment => (
                    <View
                      key={comment.id}
                      onLayout={event => handleCommentLayout(comment.id, event)}>
                      <DetailCommentCard
                        comment={comment}
                        likeDisabled={commentLikePendingIds.includes(comment.id)}
                        onPressEdit={
                          comment.isEditable
                            ? () => handleStartEditingComment(comment.id)
                            : undefined
                        }
                        onPressLike={
                          comment.isDeleted
                            ? undefined
                            : () => handleToggleCommentLike(comment.id)
                        }
                        onPressReply={
                          comment.isDeleted
                            ? undefined
                            : () => handleStartReplyingComment(comment.id)
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
              pointerEvents="box-none"
              style={styles.composerAvoidingView}>
              {isEditingComment ? (
                <View style={styles.editingBanner}>
                  <Text style={styles.editingBannerText}>댓글 수정 중</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.8}
                    onPress={handleCancelCommentEdit}>
                    <Text style={styles.editingBannerAction}>취소</Text>
                  </TouchableOpacity>
                </View>
              ) : isReplyingComment ? (
                <View style={styles.editingBanner}>
                  <Text style={styles.editingBannerText}>
                    {replyTargetLabel}
                  </Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.8}
                    onPress={handleCancelCommentReply}>
                    <Text style={styles.editingBannerAction}>취소</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <DetailComposer
                ref={composerRef}
                onChangeText={setCommentDraft}
                onSend={handleSubmitComment}
                placeholder={
                  editingCommentId
                    ? '댓글을 수정하세요...'
                    : isReplyingComment
                    ? '답글을 입력하세요...'
                    : data.commentInputPlaceholder
                }
                sendEnabled={
                  !submittingComment && commentDraft.trim().length > 0
                }
                textInputProps={{
                  blurOnSubmit: false,
                  returnKeyType: 'done',
                }}
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
  divider: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginBottom: SPACING.xl,
  },
  editingBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  editingBannerAction: {
    color: COLORS.brand.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  editingBannerText: {
    color: COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 18,
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
});

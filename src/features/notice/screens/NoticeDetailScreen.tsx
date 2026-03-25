import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
  DetailTitleHeader,
  StateCard,
} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
import {
  useKeyboardInset,
  useScreenEnterAnimation,
  useScreenView,
} from '@/shared/hooks';

import {NoticeDetailAttachments} from '../components/NoticeDetailAttachments';
import {useNoticeDetailData} from '../hooks/useNoticeDetailData';
import type {NoticeStackParamList} from '../model/navigation';

type NoticeDetailNavigationProp = NativeStackNavigationProp<
  NoticeStackParamList,
  'NoticeDetail'
>;

export const NoticeDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<NoticeDetailNavigationProp>();
  const route =
    useRoute<
      NativeStackScreenProps<NoticeStackParamList, 'NoticeDetail'>['route']
    >();
  const insets = useSafeAreaInsets();
  const {height: keyboardHeight, isVisible: isKeyboardVisible} =
    useKeyboardInset();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {
    cancelCommentEdit,
    commentDraft,
    commentItems,
    data,
    editingCommentId,
    error,
    isEditingComment,
    loading,
    notice,
    notFound,
    reload,
    setCommentDraft,
    startEditingComment,
    submitComment,
    submittingComment,
    toggleBookmark,
    toggleLike,
    togglingBookmark,
    togglingLike,
  } = useNoticeDetailData(route.params?.noticeId);

  const headerOffset = insets.top + 56;
  const scrollBottomPadding = isKeyboardVisible
    ? keyboardHeight + 88 + insets.bottom
    : 88;

  const handlePressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('NoticeMain');
  }, [navigation]);

  const handlePressReturnToList = React.useCallback(() => {
    navigation.navigate('NoticeMain');
  }, [navigation]);

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
          : isEditingComment
          ? '댓글 수정에 실패했습니다.'
          : '댓글 작성에 실패했습니다.',
      );
    });
  }, [isEditingComment, submitComment]);

  const handleStartEditingComment = React.useCallback(
    (commentId: string) => {
      startEditingComment(commentId);
    },
    [startEditingComment],
  );

  const handleCancelCommentEdit = React.useCallback(() => {
    cancelCommentEdit();
  }, [cancelCommentEdit]);

  const handleOpenExternalLink = React.useCallback(() => {
    const targetUrl = notice?.link?.trim();

    if (!targetUrl) {
      Alert.alert('안내', '외부 링크를 찾을 수 없습니다.');
      return;
    }

    Linking.openURL(targetUrl).catch(openError => {
      Alert.alert(
        '오류',
        openError instanceof Error
          ? openError.message
          : '외부 브라우저를 열지 못했습니다.',
      );
    });
  }, [notice?.link]);

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
              title="공지사항을 찾을 수 없어요"
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
              title="공지사항을 불러오지 못했습니다"
            />
          </View>
        ) : data ? (
          <>
            <ScrollView
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
              showsVerticalScrollIndicator={false}>
              <DetailTitleHeader
                authorLabel={data.authorLabel}
                badges={data.metaBadges}
                dateLabel={data.dateLabel}
                title={data.title}
              />
              <View style={styles.divider} />

              <DetailBodyBlocks blocks={data.bodyBlocks} />

              {notice?.contentAttachments.length ? (
                <View style={styles.attachmentsSection}>
                  <NoticeDetailAttachments
                    attachments={notice.contentAttachments}
                  />
                </View>
              ) : null}

              <View style={styles.reactionsRow}>
                <View style={styles.reactionsGroup}>
                  <DetailReactionChip
                    accessibilityLabel="공지사항 좋아요"
                    active={Boolean(notice?.isLiked)}
                    count={notice?.likeCount ?? 0}
                    disabled={togglingLike}
                    iconName={notice?.isLiked ? 'heart' : 'heart-outline'}
                    onPress={handleToggleLike}
                  />
                  <DetailReactionChip
                    accessibilityLabel="공지사항 북마크"
                    active={Boolean(notice?.isBookmarked)}
                    count={notice?.bookmarkCount ?? 0}
                    disabled={togglingBookmark}
                    iconName={
                      notice?.isBookmarked ? 'bookmark' : 'bookmark-outline'
                    }
                    onPress={handleToggleBookmark}
                  />
                </View>
                {notice?.link?.trim() ? (
                  <TouchableOpacity
                    accessibilityLabel="외부 브라우저에서 공지 열기"
                    accessibilityRole="button"
                    activeOpacity={0.86}
                    onPress={handleOpenExternalLink}
                    style={styles.externalLinkButton}>
                    <Icon
                      color={COLORS.brand.primaryStrong}
                      name="open-outline"
                      size={16}
                    />
                    <Text style={styles.externalLinkButtonLabel}>
                      원문 보기
                    </Text>
                  </TouchableOpacity>
                ) : null}
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
                    <DetailCommentCard
                      actionLabel={comment.isEditable ? '수정' : undefined}
                      comment={comment}
                      key={comment.id}
                      onPressAction={
                        comment.isEditable
                          ? () => handleStartEditingComment(comment.id)
                          : undefined
                      }
                    />
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
              ) : null}
              <DetailComposer
                onChangeText={setCommentDraft}
                onSend={handleSubmitComment}
                placeholder={
                  editingCommentId
                    ? '댓글을 수정하세요...'
                    : data.commentInputPlaceholder
                }
                sendEnabled={
                  !submittingComment && commentDraft.trim().length > 0
                }
                value={commentDraft}
              />
            </KeyboardAvoidingView>
          </>
        ) : null}

        <DetailBackHeader onPressBack={handlePressBack} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  attachmentsSection: {
    marginTop: SPACING.xxl,
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
  divider: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginBottom: SPACING.xxl,
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
  externalLinkButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.brand.primarySoft,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: SPACING.md,
  },
  externalLinkButtonLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  reactionsGroup: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  reactionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xxl,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
});

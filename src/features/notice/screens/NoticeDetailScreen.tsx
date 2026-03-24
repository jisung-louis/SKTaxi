import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
    commentDraft,
    data,
    error,
    loading,
    notice,
    notFound,
    reload,
    setCommentDraft,
    submitComment,
    submittingComment,
    toggleLike,
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

  const primaryBadge = data?.metaBadges[0];
  const secondaryBadges = data?.metaBadges.slice(1) ?? [];

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
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.metaRow}>
                {primaryBadge ? (
                  <ToneBadge
                    label={primaryBadge.label}
                    tone={primaryBadge.tone}
                  />
                ) : null}
                <Text style={styles.dateLabel}>{data.dateLabel}</Text>
                {secondaryBadges.map(badge => (
                  <ToneBadge
                    key={badge.id}
                    label={badge.label}
                    tone={badge.tone}
                  />
                ))}
              </View>

              <Text style={styles.title}>{data.title}</Text>
              <View style={styles.divider} />

              <DetailBodyBlocks blocks={data.bodyBlocks} />

              {data.attachments && data.attachments.length > 0 ? (
                <View style={styles.attachmentsSection}>
                  <NoticeDetailAttachments attachments={data.attachments} />
                </View>
              ) : null}

              <View style={styles.reactionsRow}>
                <DetailReactionChip
                  accessibilityLabel="공지사항 좋아요"
                  active={Boolean(notice?.isLiked)}
                  count={notice?.likeCount ?? 0}
                  disabled={togglingLike}
                  iconName={notice?.isLiked ? 'heart' : 'heart-outline'}
                  onPress={handleToggleLike}
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
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginBottom: SPACING.xxl,
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
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xxl,
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
    marginBottom: SPACING.xxl,
  },
});

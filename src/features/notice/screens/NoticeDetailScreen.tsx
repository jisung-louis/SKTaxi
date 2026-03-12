import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import CommentInput, { CommentInputRef } from '@/components/common/CommentInput';
import PageHeader from '@/components/common/PageHeader';
import { ToggleButton } from '@/components/common/ToggleButton';
import { useAuth } from '@/features/auth';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks/useScreenView';
import {
  UniversalCommentList,
  type CommentThreadItem,
} from '@/shared/ui/comments';

import {
  NoticeHtmlContent,
  NoticeImageViewer,
} from '../components';
import { useNoticeComments } from '../hooks/useNoticeComments';
import { useNoticeDetail } from '../hooks/useNoticeDetail';
import { useNoticeLike } from '../hooks/useNoticeLike';
import { NoticeStackParamList } from '../model/navigation';
import { formatNoticePostedAt } from '../model/selectors';
import { toNoticeSubviewUrl } from '../services/noticeNavigationService';

export const NoticeDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<NoticeStackParamList>>();
  const route =
    useRoute<NativeStackScreenProps<NoticeStackParamList, 'NoticeDetail'>['route']>();
  const noticeId = route.params?.noticeId;
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    authorName: string;
    isAnonymous: boolean;
  } | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [inlineImageViewerVisible, setInlineImageViewerVisible] = useState(false);
  const [inlineImageSelectedIndex, setInlineImageSelectedIndex] = useState(0);
  const [inlineImageUrls, setInlineImageUrls] = useState<string[]>([]);
  const [inlineImageMeta, setInlineImageMeta] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const commentInputRef = useRef<CommentInputRef>(null);
  const inlineImagesRef = useRef<string[]>([]);

  const { notice, loading, error } = useNoticeDetail(noticeId);
  const { isLiked, likeCount, loading: likeLoading, toggleLike } = useNoticeLike(
    noticeId || '',
  );
  const {
    comments: rawComments,
    loading: commentsLoading,
    submitting: commentsSubmitting,
    addComment,
    addReply,
    updateComment,
    deleteComment,
  } = useNoticeComments(noticeId || '');

  const handleReply = useCallback(
    (comment: CommentThreadItem) => {
      setReplyingTo({
        commentId: comment.id,
        authorName: comment.authorName,
        isAnonymous: !!comment.isAnonymous,
      });
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    },
    [],
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const comments = useMemo(() => {
    const convertComment = (comment: any): CommentThreadItem => {
      const authorName = comment.isAnonymous
        ? comment.anonymousOrder
          ? `익명${comment.anonymousOrder}`
          : '익명'
        : comment.userDisplayName || comment.authorName;

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        authorId: comment.userId || comment.authorId,
        isAnonymous: comment.isAnonymous,
        authorName,
        anonymousOrder: comment.anonymousOrder,
        isDeleted: comment.isDeleted,
        hiddenReason: comment.isDeleted ? 'deleted' : undefined,
        canReply: Boolean(user?.uid) && !comment.isDeleted,
        canEdit: Boolean(user?.uid) && user?.uid === (comment.userId || comment.authorId) && !comment.isDeleted,
        canDelete: Boolean(user?.uid) && user?.uid === (comment.userId || comment.authorId) && !comment.isDeleted,
        replies: comment.replies?.map((reply: any) => convertComment(reply)) || [],
      };
    };

    return rawComments.map((comment) => convertComment(comment));
  }, [rawComments, user?.uid]);

  const handleInlineImageLoaded = useCallback(
    ({ url, width: imageWidth, height: imageHeight }: { url: string; width: number; height: number }) => {
      if (!url) {
        return;
      }

      setInlineImageMeta((prev) =>
        prev[url] ? prev : { ...prev, [url]: { width: imageWidth, height: imageHeight } },
      );

      if (!inlineImagesRef.current.includes(url)) {
        inlineImagesRef.current = [...inlineImagesRef.current, url];
        setInlineImageUrls(inlineImagesRef.current);
      }
    },
    [],
  );

  const handleInlineImagePress = useCallback((url: string) => {
    if (!url) {
      return;
    }

    let index = inlineImagesRef.current.indexOf(url);
    if (index === -1) {
      inlineImagesRef.current = [...inlineImagesRef.current, url];
      setInlineImageUrls(inlineImagesRef.current);
      index = inlineImagesRef.current.length - 1;
    }

    setInlineImageSelectedIndex(index);
    setInlineImageViewerVisible(true);
  }, []);

  const formattedDate = useMemo(() => {
    return formatNoticePostedAt(notice?.postedAt);
  }, [notice?.postedAt]);

  const inlineViewerImages = useMemo(
    () =>
      inlineImageUrls.map((url) => ({
        url,
        width: inlineImageMeta[url]?.width || width,
        height: inlineImageMeta[url]?.height || width,
      })),
    [inlineImageMeta, inlineImageUrls, width],
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="공지사항" borderBottom />
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.accent.green} size="large" />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Icon name="alert-circle" size={48} color={COLORS.accent.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.contentWrap,
            {
              paddingBottom: isEditingComment
                ? keyboardHeight > 0
                  ? keyboardHeight + 391
                  : 371
                : keyboardHeight > 0
                  ? keyboardHeight + 141
                  : 121,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.noticeContainer}>
            <View style={styles.headerBlock}>
              <View style={styles.chipsRow}>
                {!!notice?.department && (
                  <View style={[styles.chip, styles.deptChip]}>
                    <Text style={[styles.chipText, styles.deptChipText]}>
                      {notice.department}
                    </Text>
                  </View>
                )}
                {!!notice?.category && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{notice.category}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{notice?.title}</Text>
              <View style={styles.metaRow}>
                {!!notice?.author && <Text style={styles.metaText}>{notice.author}</Text>}
                {!!formattedDate && (
                  <View style={styles.metaDotRow}>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{formattedDate}</Text>
                  </View>
                )}
                <View style={styles.metaDotRow}>
                  <View style={styles.dot} />
                  <View style={styles.viewCountRow}>
                    <Icon name="eye-outline" size={14} color={COLORS.text.secondary} />
                    <Text style={styles.metaText}>{notice?.viewCount || 0}회 조회</Text>
                  </View>
                </View>
              </View>
            </View>

            <NoticeHtmlContent
              contentWidth={width - 40}
              html={notice?.contentDetail}
              fallbackText={notice?.content}
              onImageLoaded={handleInlineImageLoaded}
              onImagePress={handleInlineImagePress}
            />

            {!!notice?.contentAttachments?.length && (
              <View style={styles.attachmentsCard}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Icon
                    name="attach-outline"
                    size={16}
                    color={COLORS.text.secondary}
                  />
                  <Text
                    style={{
                      ...TYPOGRAPHY.body2,
                      color: COLORS.text.secondary,
                    }}
                  >
                    첨부파일
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {notice.contentAttachments.map((attachment, index) => (
                    <View key={`${attachment.downloadUrl || index}`} style={styles.attachmentRow}>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(attachment.downloadUrl)}
                        activeOpacity={0.85}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          flex: 1,
                        }}
                      >
                        <Icon
                          name="document-text-outline"
                          size={18}
                          color={COLORS.accent.green}
                        />
                        <Text numberOfLines={1} style={styles.attachmentName}>
                          {attachment.name || '첨부파일'}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {!!attachment.previewUrl && (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(attachment.previewUrl)}
                            activeOpacity={0.85}
                            style={styles.chipButton}
                          >
                            <Icon
                              name="eye-outline"
                              size={14}
                              color={COLORS.accent.green}
                            />
                            <Text style={styles.chipButtonText}>바로보기</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!!notice?.link && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('NoticeDetailWebView', { noticeId: noticeId || '' })
                }
                activeOpacity={0.8}
                style={styles.linkCard}
              >
                <Icon name="link-outline" size={18} color={COLORS.accent.green} />
                <Text numberOfLines={1} style={styles.linkText}>
                  {toNoticeSubviewUrl(notice.link)}
                </Text>
                <Icon name="open-outline" size={18} color={COLORS.accent.green} />
              </TouchableOpacity>
            )}

            <View style={styles.interactionRow}>
              <ToggleButton
                type="like"
                isActive={isLiked}
                count={likeCount}
                onPress={toggleLike}
                loading={likeLoading}
                size="medium"
              />
              <ToggleButton
                type="comment"
                count={notice?.commentCount || 0}
                onPress={() => {}}
                size="medium"
                disabled
              />
            </View>
          </View>

          <UniversalCommentList
            comments={comments}
            loading={commentsLoading}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            submitting={commentsSubmitting}
            onReply={handleReply}
            replyingToCommentId={replyingTo?.commentId}
            onEditStateChange={setIsEditingComment}
          />
        </ScrollView>
      )}

      {!replyingTo && !isEditingComment && (
        <CommentInput
          ref={commentInputRef}
          onSubmit={async (content: string, isAnonymous?: boolean) => {
            await addComment(content, undefined, isAnonymous);
          }}
          submitting={commentsSubmitting}
          placeholder="댓글을 입력하세요..."
          parentId={undefined}
          onKeyboardHeightChange={setKeyboardHeight}
          onCancelReply={handleCancelReply}
        />
      )}

      {replyingTo && !isEditingComment && (
        <CommentInput
          ref={commentInputRef}
          onSubmit={async (content: string, isAnonymous?: boolean) => {
            await addReply(replyingTo.commentId, content, isAnonymous);
            setReplyingTo(null);
          }}
          submitting={commentsSubmitting}
          placeholder={
            replyingTo.isAnonymous
              ? '익명님에게 답글...'
              : `${replyingTo.authorName}님에게 답글...`
          }
          parentId={replyingTo.commentId}
          onKeyboardHeightChange={setKeyboardHeight}
          onCancelReply={handleCancelReply}
        />
      )}

      {inlineViewerImages.length > 0 && (
        <NoticeImageViewer
          visible={inlineImageViewerVisible}
          images={inlineViewerImages}
          initialIndex={inlineImageSelectedIndex}
          onClose={() => setInlineImageViewerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  contentWrap: {
    paddingTop: 16,
    paddingBottom: 30,
    gap: 16,
  },
  noticeContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerBlock: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: `${COLORS.accent.green}20`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  deptChip: {
    backgroundColor: COLORS.background.card,
    outlineWidth: 1,
    outlineColor: COLORS.border.default,
  },
  deptChipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border.dark,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  bodyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  attachmentsCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  attachmentName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${COLORS.accent.green}14`,
  },
  chipButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  linkText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

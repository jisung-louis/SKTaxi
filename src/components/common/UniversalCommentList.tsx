import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createReport, blockUser, shouldHideContent } from '../../lib/moderation';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

// 공통 댓글 인터페이스
interface UniversalComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  parentId?: string;
  authorId: string;
  authorName: string;
  isAnonymous?: boolean;
  anonId?: string;
  anonymousOrder?: number;
}

interface UniversalCommentListProps {
  comments: (UniversalComment & { replies: UniversalComment[] })[];
  loading: boolean;
  onAddComment: (content: string, isAnonymous?: boolean) => Promise<void>;
  onAddReply: (parentId: string, content: string, isAnonymous?: boolean) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onReply: (commentId: string, authorName: string, isAnonymous: boolean) => void;
  submitting?: boolean;
  currentUserId?: string;
  postAuthorId?: string; // 게시글 작성자 ID
  borderTop?: boolean;
  replyingToCommentId?: string;
  onEditStateChange?: (isEditing: boolean) => void;
}

const UniversalCommentList: React.FC<UniversalCommentListProps> = ({
  comments,
  loading,
  onAddComment,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onReply,
  submitting = false,
  currentUserId,
  postAuthorId,
  borderTop = true,
  replyingToCommentId,
  onEditStateChange,
}) => {
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [blockedAuthors, setBlockedAuthors] = useState<Record<string, boolean>>({});

  // 차단 사용자 사전 조회 (댓글 + 대댓글 작성자)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const authorIds = new Set<string>();
      comments.forEach(c => {
        if (c.authorId) authorIds.add(c.authorId);
        c.replies?.forEach(r => { if (r.authorId) authorIds.add(r.authorId); });
      });
      const ids = Array.from(authorIds);
      if (ids.length === 0) { if (!cancelled) setBlockedAuthors({}); return; }
      try {
        const res = await Promise.all(ids.map(async id => ({ id, hide: await shouldHideContent(id) })));
        const map: Record<string, boolean> = {};
        res.forEach(({ id, hide }) => { map[id] = hide; });
        if (!cancelled) setBlockedAuthors(map);
      } catch {
        if (!cancelled) setBlockedAuthors({});
      }
    })();
    return () => { cancelled = true; };
  }, [comments]);

  const handleReply = (commentId: string, authorName: string, isAnonymous: boolean) => {
    onReply(commentId, authorName, isAnonymous);
  };

  const handleEdit = (comment: UniversalComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    onEditStateChange?.(true);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    onEditStateChange?.(false);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      await onUpdateComment(editingComment, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      onEditStateChange?.(false);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  const findCommentById = (id: string): { authorId: string } | null => {
    for (const c of comments) {
      if (c.id === id) return { authorId: c.authorId };
      const reply = c.replies.find(r => r.id === id);
      if (reply) return { authorId: reply.authorId };
    }
    return null;
  };

  const handleReport = async (commentId: string) => {
    const found = findCommentById(commentId);
    if (!found) return;
    const categories: Array<'스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타'> = ['스팸', '욕설/혐오', '불법/위험', '음란물', '기타'];
    Alert.alert(
      '댓글 신고',
      '신고 사유를 선택해주세요.',
      [
        ...categories.map((cat) => ({
          text: cat,
          onPress: async () => {
            try {
              await createReport({
                targetType: 'comment',
                targetId: commentId,
                targetAuthorId: found.authorId,
                category: cat,
              });
              Alert.alert(
                '신고 완료',
                '운영자가 24시간 이내 검토합니다. 감사합니다.',
                [
                  {
                    text: '작성자 차단',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await blockUser(found.authorId);
                        // 로컬 즉시 반영: 차단 사용자 맵 업데이트
                        setBlockedAuthors(prev => ({ ...prev, [found.authorId]: true }));
                        Alert.alert('차단 완료', '해당 사용자의 댓글이 더 이상 표시되지 않습니다.');
                      } catch (e) {
                        Alert.alert('오류', '차단에 실패했습니다. 잠시 후 다시 시도해주세요.');
                      }
                    },
                  },
                  { text: '확인' },
                ]
              );
            } catch (e) {
              Alert.alert('오류', '신고에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
          },
        })),
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (commentId: string) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => onDeleteComment(commentId)
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const CommentItem: React.FC<{ 
    comment: UniversalComment; 
    isReply?: boolean; 
  }> = ({ 
    comment, 
    isReply = false
  }) => {
    const isOwner = currentUserId === comment.authorId;
    const isAuthor = postAuthorId === comment.authorId;
    const isEditing = editingComment === comment.id;
    const isEdited = comment.updatedAt && comment.updatedAt > comment.createdAt;
    const isReplyingTo = replyingToCommentId === comment.id;
    const isBlockedAuthor = !!blockedAuthors[comment.authorId];
    const isDeleted = !!comment.isDeleted;
    const displayName = comment.isAnonymous 
      ? (comment.anonymousOrder ? `익명${comment.anonymousOrder}` : '익명')
      : comment.authorName;

    return (
      <View style={[
        styles.commentItem, 
        isReply && styles.replyItem,
      ]}>
        {/* 답글 아이콘 */}
        {isReply && 
          <View style={styles.replyIconContainer}>
            <Icon name="return-down-forward" size={20} color={COLORS.text.secondary} />
          </View>
        }
        
        <View style={[styles.commentContent, isReply && styles.replyContent, isReplyingTo && styles.replyingToItem]}>
          <View style={styles.commentHeader}>
            <View style={[styles.authorAvatar, comment.isAnonymous && styles.anonymousAvatar]}>
              <Text style={styles.authorInitial}>
                {comment.isAnonymous ? '익' : comment.authorName.charAt(0)}
              </Text>
            </View>
            <View style={styles.authorNameContainer}>
              <Text style={[
                styles.authorName,
                isAuthor && styles.authorNameHighlight
              ]}>
                {displayName}
              </Text>
              {isAuthor && (
                <Text style={styles.authorLabel}>(작성자)</Text>
              )}
            </View>
            {(!isBlockedAuthor && !isDeleted) && (
            <View style={styles.actionsRow}>
              {isOwner && (
                <View style={styles.ownerActions}>
                  <TouchableOpacity 
                    onPress={() => handleEdit(comment)}
                    style={styles.actionButton}
                  >
                    <Icon name="create-outline" size={14} color={COLORS.text.secondary} />
                    <Text style={styles.actionText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(comment.id)}
                    style={styles.actionButton}
                  >
                    <Icon name="trash-outline" size={14} color={COLORS.text.secondary} />
                    <Text style={styles.actionText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!isOwner && (
                <TouchableOpacity 
                  onPress={() => handleReport(comment.id)}
                  style={styles.actionButton}
                >
                  <Icon name="alert-circle-outline" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.actionText}>신고</Text>
                </TouchableOpacity>
              )}
            </View>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                maxLength={500}
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.editButton}>
                  <Text style={styles.editButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveEdit} 
                  style={[styles.editButton, styles.saveButton]}
                  disabled={!editContent.trim() || submitting}
                >
                  <Text style={[styles.editButtonText, styles.saveButtonText]}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {(isBlockedAuthor || isDeleted) ? (
                <>
                  <Text style={[styles.commentText, { color: COLORS.text.disabled }]}>
                    {isDeleted
                      ? (isReply ? '삭제된 답글입니다.' : '삭제된 댓글입니다.')
                      : (isReply ? '차단된 사용자의 답글입니다.' : '차단된 사용자의 댓글입니다.')}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                  </View>
                </>
          ) : (
            <>
              <Text style={styles.commentText}>{comment.content}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.commentDate}>{formatDate(comment.createdAt)} {isEdited && <Text style={styles.commentDate}> • 수정됨</Text>}</Text>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleReply(
                    comment.id, 
                    comment.isAnonymous 
                      ? (comment.anonymousOrder ? `익명${comment.anonymousOrder}` : '익명')
                      : comment.authorName, 
                    !!comment.isAnonymous
                  )}
                >
                  <Icon name="return-down-forward" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.actionText}>답글</Text>
                </TouchableOpacity>
              </View>
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  // 재귀적으로 모든 자식 댓글이 삭제되었는지 확인하는 함수
  const areAllChildrenDeleted = (comment: UniversalComment & { replies?: UniversalComment[] }): boolean => {
    if (!comment.replies || comment.replies.length === 0) {
      return true; // 자식이 없으면 true (숨김 가능)
    }
    // 모든 자식이 삭제되었고, 각 자식의 모든 자식도 삭제되었는지 재귀적으로 확인
    return comment.replies.every(reply => {
      const replyWithReplies = reply as any;
      return !!reply.isDeleted && areAllChildrenDeleted(replyWithReplies);
    });
  };

  // 댓글이 숨겨져야 하는지 확인하는 함수
  const shouldHideComment = (comment: UniversalComment & { replies?: UniversalComment[] }): boolean => {
    return !!comment.isDeleted && areAllChildrenDeleted(comment);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.accent.green} size="large" />
        <Text style={styles.loadingText}>댓글을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderTopWidth: borderTop ? 1 : 0, borderTopColor: COLORS.border.default }]}>
      {comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubble-outline" size={48} color={COLORS.text.disabled} />
          <Text style={styles.emptyText}>첫 번째 댓글을 작성해보세요!</Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => {
            // 삭제된 댓글이며, 모든 자식(재귀적으로)이 삭제되었으면 완전히 숨김
            if (shouldHideComment(comment)) {
              return null;
            }
            return (
            <View key={comment.id} style={styles.commentGroup}>
              <CommentItem comment={comment} />
              {/* 대댓글 (재귀적으로 렌더링) */}
              {comment.replies && comment.replies.length > 0 && (
                <View style={styles.repliesContainer}>
                  {comment.replies.map((reply) => {
                    // 재귀적으로 답글 렌더링하는 함수
                    const renderReply = (replyComment: UniversalComment) => {
                      const replyWithReplies = replyComment as any;
                      // 삭제된 답글이며, 모든 자식(재귀적으로)이 삭제되었으면 완전히 숨김
                      if (shouldHideComment(replyWithReplies)) {
                        return null;
                      }
                      return (
                        <React.Fragment key={replyComment.id}>
                          <CommentItem 
                            comment={replyComment} 
                            isReply 
                          />
                          {/* 답글의 답글 (재귀적으로 렌더링) */}
                          {replyWithReplies.replies && replyWithReplies.replies.length > 0 && (
                            <View style={styles.repliesContainer}>
                              {replyWithReplies.replies.map((nestedReply: UniversalComment) => 
                                renderReply(nestedReply)
                              )}
                            </View>
                          )}
                        </React.Fragment>
                      );
                    };
                    return renderReply(reply);
                  })}
                </View>
              )}
            </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.disabled,
    marginTop: 8,
  },
  commentsList: {
  },
  commentGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  commentItem: {
    flexDirection: 'row',
    flex:1,
    gap: 8,
    alignItems: 'flex-start',
  },
  replyItem: {
    marginTop: -4,
    marginBottom: 6,
  },
  replyContent: {
    paddingHorizontal: 12,
    backgroundColor: COLORS.background.card,
    outlineWidth: 1,
    outlineColor: COLORS.border.default,
    borderRadius: 8,
  },
  replyIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  commentContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginVertical: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  anonymousAvatar: {
    backgroundColor: COLORS.text.secondary,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  authorNameHighlight: {
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  authorLabel: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.accent.blue,
    fontWeight: '600',
    backgroundColor: COLORS.accent.blue + '12',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  commentDate: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.disabled,
    marginTop: 4,
  },
  commentText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  saveButton: {
    backgroundColor: COLORS.accent.green,
    borderColor: COLORS.accent.green,
  },
  editButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  saveButtonText: {
    color: COLORS.background.card,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 0,
  },
  replyingToItem: {
    backgroundColor: COLORS.accent.blue + '10',
    borderRadius: 8,
    outlineWidth: 1,
    outlineColor: COLORS.accent.blue + '30',
  },
});

export default UniversalCommentList;

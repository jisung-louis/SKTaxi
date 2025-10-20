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
}) => {
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleReply = (commentId: string, authorName: string, isAnonymous: boolean) => {
    onReply(commentId, authorName, isAnonymous);
  };

  const handleEdit = (comment: UniversalComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      await onUpdateComment(editingComment, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
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
    const isReplyingTo = replyingToCommentId === comment.id;
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
            </View>
          </View>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                maxLength={500}
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
              <Text style={styles.commentText}>{comment.content}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
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
        </View>
      </View>
    );
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
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentGroup}>
              <CommentItem comment={comment} />
              
              {/* 대댓글 */}
              {comment.replies.length > 0 && (
                <View style={styles.repliesContainer}>
                  {comment.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      isReply 
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
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

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
import CommentInput from './CommentInput';

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
}

interface UniversalCommentListProps {
  comments: (UniversalComment & { replies: UniversalComment[] })[];
  loading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onAddReply: (parentId: string, content: string) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  submitting?: boolean;
  currentUserId?: string;
}

const UniversalCommentList: React.FC<UniversalCommentListProps> = ({
  comments,
  loading,
  onAddComment,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  submitting = false,
  currentUserId
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
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

  const CommentItem: React.FC<{ comment: UniversalComment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => {
    const isOwner = currentUserId === comment.authorId;
    const isEditing = editingComment === comment.id;

    return (
      <View style={[styles.commentItem, isReply && styles.replyItem]}>
        <View style={styles.commentHeader}>
          <Text style={styles.authorName}>{comment.authorName}</Text>
          <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
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
            <Text style={styles.commentContent}>{comment.content}</Text>
            
            {isOwner && (
              <View style={styles.commentActions}>
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
                  <Icon name="trash-outline" size={14} color={COLORS.accent.red} />
                  <Text style={[styles.actionText, { color: COLORS.accent.red }]}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
    <View style={styles.container}>
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
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                </View>
              )}
              
              {/* 답글 버튼 */}
              <TouchableOpacity 
                style={styles.replyButton}
                onPress={() => handleReply(comment.id)}
              >
                <Icon name="return-up-forward" size={14} color={COLORS.accent.green} />
                <Text style={styles.replyText}>답글</Text>
              </TouchableOpacity>
              
              {/* 답글 입력 */}
              {replyingTo === comment.id && (
                <CommentInput
                  onSubmit={(content) => onAddReply(comment.id, content)}
                  submitting={submitting}
                  placeholder={`${comment.authorName}님에게 답글...`}
                  parentId={comment.id}
                  onCancel={() => setReplyingTo(null)}
                  showCancel
                />
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
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingHorizontal: 20,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  commentItem: {
    marginBottom: 8,
  },
  replyItem: {
    marginLeft: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent.green + '40',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  commentDate: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.disabled,
    marginLeft: 8,
  },
  commentContent: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
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
    marginTop: 8,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  replyText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '500',
  },
});

export default UniversalCommentList;

import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  UniversalCommentList,
  type CommentThreadItem,
} from '@/shared/ui/comments';

import {
  BOARD_REPORT_CATEGORIES,
  blockBoardAuthor,
  submitBoardCommentReport,
} from '../services/boardModerationService';

interface BoardCommentListProps {
  comments: CommentThreadItem[];
  loading: boolean;
  submitting?: boolean;
  borderTop?: boolean;
  replyingToCommentId?: string;
  onReply: (comment: CommentThreadItem) => void;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onEditStateChange?: (isEditing: boolean) => void;
}

export function BoardCommentList({
  comments,
  loading,
  submitting,
  borderTop,
  replyingToCommentId,
  onReply,
  onUpdateComment,
  onDeleteComment,
  onEditStateChange,
}: BoardCommentListProps) {
  const [locallyBlockedAuthorIds, setLocallyBlockedAuthorIds] = useState<
    Record<string, boolean>
  >({});

  const resolvedComments = useMemo(() => {
    const applyBlockedAuthors = (nodes: CommentThreadItem[]): CommentThreadItem[] =>
      nodes.map((node) => {
        const isBlocked = locallyBlockedAuthorIds[node.authorId];
        return {
          ...node,
          hiddenReason: node.hiddenReason || (isBlocked ? 'blocked' : undefined),
          canReply: isBlocked ? false : node.canReply,
          canEdit: isBlocked ? false : node.canEdit,
          canDelete: isBlocked ? false : node.canDelete,
          canReport: isBlocked ? false : node.canReport,
          replies: applyBlockedAuthors(node.replies),
        };
      });

    return applyBlockedAuthors(comments);
  }, [comments, locallyBlockedAuthorIds]);

  const handleReportComment = useCallback((comment: CommentThreadItem) => {
    Alert.alert(
      '댓글 신고',
      '신고 사유를 선택해주세요.',
      [
        ...BOARD_REPORT_CATEGORIES.map((category) => ({
          text: category,
          onPress: async () => {
            try {
              await submitBoardCommentReport(comment.id, comment.authorId, category);
              Alert.alert(
                '신고 완료',
                '운영자가 24시간 이내 검토합니다. 감사합니다.',
                [
                  {
                    text: '작성자 차단',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await blockBoardAuthor(comment.authorId);
                        setLocallyBlockedAuthorIds((prev) => ({
                          ...prev,
                          [comment.authorId]: true,
                        }));
                        Alert.alert('차단 완료', '해당 사용자의 댓글이 더 이상 표시되지 않습니다.');
                      } catch {
                        Alert.alert('오류', '차단에 실패했습니다. 잠시 후 다시 시도해주세요.');
                      }
                    },
                  },
                  { text: '확인' },
                ],
              );
            } catch {
              Alert.alert('오류', '신고에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
          },
        })),
        { text: '취소', style: 'cancel' },
      ],
    );
  }, []);

  return (
    <UniversalCommentList
      comments={resolvedComments}
      loading={loading}
      submitting={submitting}
      borderTop={borderTop}
      replyingToCommentId={replyingToCommentId}
      onReply={onReply}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
      onEditStateChange={onEditStateChange}
      onReportComment={handleReportComment}
    />
  );
}

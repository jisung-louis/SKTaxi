import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {useAuth} from '@/features/auth';
import {formatKoreanAbsoluteWithRelativeTime} from '@/shared/lib/date';
import type {ContentDetailViewData} from '@/shared/types/contentDetailViewData';

import type {BoardCommentTreeNode} from '../data/repositories/IBoardRepository';
import type {BoardComment, BoardPost} from '../model/types';
import {useBoardRepository} from './useBoardRepository';

const CATEGORY_LABEL_MAP: Record<BoardPost['category'], string> = {
  announcement: '정보게시판',
  general: '자유게시판',
  question: '질문게시판',
  review: '후기게시판',
};

const formatBoardCommentDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'M월 d일', {locale: ko});
};

const splitParagraphs = (content: string) =>
  content
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

const formatViewCountLabel = (value: number) => value.toLocaleString('ko-KR');

const flattenComments = (
  comments: BoardCommentTreeNode[],
): BoardCommentTreeNode[] =>
  comments.flatMap(comment => [comment, ...flattenComments(comment.replies)]);

const getCommentAuthorLabel = (comment: BoardComment) => {
  if (!comment.isAnonymous) {
    return comment.authorName;
  }

  return `익명${comment.anonymousOrder ?? ''}`;
};

const toViewData = (
  post: BoardPost,
  comments: BoardCommentTreeNode[],
): ContentDetailViewData => ({
  authorLabel: post.isAnonymous ? '익명' : post.authorName,
  bodyBlocks: [
    ...splitParagraphs(post.content).map((paragraph, index) => ({
      id: `${post.id}-paragraph-${index + 1}`,
      text: paragraph,
      type: 'paragraph' as const,
    })),
    ...(post.images ?? []).map((image, index) => ({
      aspectRatio:
        image.width && image.height ? image.width / image.height : undefined,
      id: `${post.id}-image-${index + 1}`,
      imageUrl: image.url,
      type: 'image' as const,
    })),
  ],
  commentInputPlaceholder: '댓글을 입력하세요...',
  comments: flattenComments(comments).map(comment => ({
    authorLabel: getCommentAuthorLabel(comment),
    body: comment.content,
    dateLabel: formatBoardCommentDateLabel(comment.createdAt.toISOString()),
    id: comment.id,
    likeCount: 0,
  })),
  dateLabel: formatKoreanAbsoluteWithRelativeTime(post.createdAt),
  emptyCommentsLabel: '첫 댓글을 남겨보세요!',
  metaBadges: [
    {
      id: `${post.id}-category`,
      label: CATEGORY_LABEL_MAP[post.category],
      tone: 'gray',
    },
  ],
  reactions: [
    {
      count: post.likeCount,
      iconName: post.isLiked ? 'heart' : 'heart-outline',
      id: `${post.id}-likes`,
    },
    {
      count: post.bookmarkCount,
      iconName: post.isBookmarked ? 'bookmark' : 'bookmark-outline',
      id: `${post.id}-bookmarks`,
    },
  ],
  title: post.title,
  viewCountLabel: formatViewCountLabel(post.viewCount),
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '게시물을 다시 불러와주세요.';
};

export const useBoardDetailData = (postId?: string) => {
  const {user} = useAuth();
  const boardRepository = useBoardRepository();
  const [post, setPost] = React.useState<BoardPost | null>(null);
  const [comments, setComments] = React.useState<BoardCommentTreeNode[]>([]);
  const [commentDraft, setCommentDraft] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [togglingLike, setTogglingLike] = React.useState(false);
  const [togglingBookmark, setTogglingBookmark] = React.useState(false);
  const [submittingComment, setSubmittingComment] = React.useState(false);
  const [deletingPost, setDeletingPost] = React.useState(false);
  const requestIdRef = React.useRef(0);

  const loadDetail = React.useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    setLoading(true);

    try {
      if (!postId) {
        setPost(null);
        setComments([]);
        setNotFound(true);
        setError(null);
        return;
      }

      const [nextPost, nextComments] = await Promise.all([
        boardRepository.getPost(postId),
        boardRepository.getComments(postId),
      ]);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!nextPost) {
        setPost(null);
        setComments([]);
        setNotFound(true);
        setError(null);
        return;
      }

      setPost(nextPost);
      setComments(nextComments);
      setNotFound(false);
      setError(null);
    } catch (loadError) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(loadError));
      setPost(null);
      setComments([]);
      setNotFound(false);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [boardRepository, postId]);

  React.useEffect(() => {
    loadDetail().catch(() => undefined);
  }, [loadDetail]);

  const canManageActions = React.useMemo(() => {
    if (!post) {
      return false;
    }

    return Boolean(post.isAuthor ?? (user?.uid && post.authorId === user.uid));
  }, [post, user?.uid]);

  const toggleLike = React.useCallback(async () => {
    if (!postId || !user?.uid || togglingLike) {
      throw new Error('로그인이 필요합니다.');
    }

    setTogglingLike(true);

    try {
      const nextIsLiked = await boardRepository.toggleLike(postId, user.uid);
      setPost(currentPost => {
        if (!currentPost) {
          return currentPost;
        }

        const previousIsLiked = Boolean(currentPost.isLiked);
        const likeDelta =
          previousIsLiked === nextIsLiked ? 0 : nextIsLiked ? 1 : -1;

        return {
          ...currentPost,
          isLiked: nextIsLiked,
          likeCount: Math.max(0, currentPost.likeCount + likeDelta),
        };
      });
    } finally {
      setTogglingLike(false);
    }
  }, [boardRepository, postId, togglingLike, user?.uid]);

  const toggleBookmark = React.useCallback(async () => {
    if (!postId || !user?.uid || togglingBookmark) {
      throw new Error('로그인이 필요합니다.');
    }

    setTogglingBookmark(true);

    try {
      const nextIsBookmarked = await boardRepository.toggleBookmark(
        postId,
        user.uid,
      );
      setPost(currentPost => {
        if (!currentPost) {
          return currentPost;
        }

        const previousIsBookmarked = Boolean(currentPost.isBookmarked);
        const bookmarkDelta =
          previousIsBookmarked === nextIsBookmarked
            ? 0
            : nextIsBookmarked
            ? 1
            : -1;

        return {
          ...currentPost,
          bookmarkCount: Math.max(0, currentPost.bookmarkCount + bookmarkDelta),
          isBookmarked: nextIsBookmarked,
        };
      });
    } finally {
      setTogglingBookmark(false);
    }
  }, [boardRepository, postId, togglingBookmark, user?.uid]);

  const submitComment = React.useCallback(async () => {
    if (!postId || !user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    const trimmedComment = commentDraft.trim();
    if (!trimmedComment) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    setSubmittingComment(true);

    try {
      await boardRepository.createComment(postId, {
        anonId: null,
        authorId: user.uid,
        authorName: user.displayName ?? '익명',
        authorProfileImage: user.photoURL ?? null,
        content: trimmedComment,
        isAnonymous: false,
        isDeleted: false,
        parentId: null,
      });

      const nextComments = await boardRepository.getComments(postId);
      setComments(nextComments);
      setCommentDraft('');
      setPost(currentPost =>
        currentPost
          ? {
              ...currentPost,
              commentCount: flattenComments(nextComments).length,
            }
          : currentPost,
      );
    } finally {
      setSubmittingComment(false);
    }
  }, [boardRepository, commentDraft, postId, user]);

  const deletePost = React.useCallback(async () => {
    if (!postId) {
      throw new Error('게시글 정보를 찾을 수 없습니다.');
    }

    setDeletingPost(true);

    try {
      await boardRepository.deletePost(postId);
    } finally {
      setDeletingPost(false);
    }
  }, [boardRepository, postId]);

  const data = React.useMemo(
    () => (post ? toViewData(post, comments) : null),
    [comments, post],
  );

  return {
    canManageActions,
    commentDraft,
    data,
    deletePost,
    deletingPost,
    error,
    loading,
    notFound,
    post,
    reload: loadDetail,
    setCommentDraft,
    submitComment,
    submittingComment,
    toggleBookmark,
    toggleLike,
    togglingBookmark,
    togglingLike,
  };
};

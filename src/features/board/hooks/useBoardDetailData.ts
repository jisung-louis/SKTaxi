import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {ContentDetailViewData} from '@/shared/types/contentDetailViewData';

import type {BoardCommentTreeNode} from '../data/repositories/IBoardRepository';
import type {BoardPost} from '../model/types';
import {useBoardRepository} from './useBoardRepository';

const CATEGORY_LABEL_MAP: Record<BoardPost['category'], string> = {
  announcement: '정보게시판',
  general: '자유게시판',
  question: '질문게시판',
  review: '후기게시판',
};

const formatBoardDateLabel = (value: string) => {
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

const flattenComments = (
  comments: BoardCommentTreeNode[],
): BoardCommentTreeNode[] =>
  comments.flatMap(comment => [comment, ...flattenComments(comment.replies)]);

const toViewData = (
  post: BoardPost,
  comments: BoardCommentTreeNode[],
): ContentDetailViewData => ({
  authorLabel: post.authorName,
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
    authorLabel: comment.authorName,
    body: comment.content,
    dateLabel: formatBoardDateLabel(comment.createdAt.toISOString()),
    id: comment.id,
    likeCount: 0,
  })),
  dateLabel: formatBoardDateLabel(post.createdAt.toISOString()),
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
      iconName: 'heart-outline',
      id: `${post.id}-likes`,
    },
    {
      count: post.bookmarkCount,
      iconName: 'bookmark-outline',
      id: `${post.id}-bookmarks`,
    },
  ],
  title: post.title,
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '게시물을 다시 불러와주세요.';
};

export const useBoardDetailData = (postId?: string) => {
  const boardRepository = useBoardRepository();
  const [data, setData] = React.useState<ContentDetailViewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const requestIdRef = React.useRef(0);

  const loadDetail = React.useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    setLoading(true);

    try {
      if (!postId) {
        setData(null);
        setNotFound(true);
        setError(null);
        return;
      }

      const [post, comments] = await Promise.all([
        boardRepository.getPost(postId),
        boardRepository.getComments(postId),
      ]);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!post) {
        setData(null);
        setNotFound(true);
        setError(null);
        return;
      }

      setData(toViewData(post, comments));
      setNotFound(false);
      setError(null);
    } catch (loadError) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(loadError));
      setData(null);
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

  return {
    data,
    error,
    loading,
    notFound,
    reload: loadDetail,
  };
};

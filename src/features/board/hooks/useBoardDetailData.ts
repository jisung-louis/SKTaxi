import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {ContentDetailViewData} from '@/shared/types/contentDetailViewData';

import type {BoardDetailSourceItem} from '../model/boardDetailData';
import {boardDetailRepository} from '../data/repositories/boardDetailRepository';

const CATEGORY_LABEL_MAP: Record<BoardDetailSourceItem['category'], string> = {
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

const toViewData = (post: BoardDetailSourceItem): ContentDetailViewData => ({
  authorLabel: post.authorName,
  bodyBlocks: post.bodyBlocks,
  commentInputPlaceholder: '댓글을 입력하세요...',
  comments: post.comments.map(comment => ({
    authorLabel: comment.authorName,
    body: comment.content,
    dateLabel: formatBoardDateLabel(comment.postedAt),
    id: comment.id,
    likeCount: comment.likeCount,
  })),
  dateLabel: formatBoardDateLabel(post.createdAt),
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

      const post = await boardDetailRepository.getBoardDetail(postId);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!post) {
        setData(null);
        setNotFound(true);
        setError(null);
        return;
      }

      setData(toViewData(post));
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
  }, [postId]);

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

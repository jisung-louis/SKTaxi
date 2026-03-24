import React from 'react';

import {useAuth} from '@/features/auth';
import type {
  ContentDetailBodyBlockViewData,
  ContentDetailViewData,
} from '@/shared/types/contentDetailViewData';

import {normalizeNoticeHtml} from '../model/selectors';
import type {Notice, NoticeCommentTreeNode} from '../model/types';
import {useNoticeRepository} from './useNoticeRepository';

const CATEGORY_DISPLAY_LABEL_MAP: Record<string, string> = {
  '공모/행사': '행사',
  '장학/등록/학자금': '장학',
  '취업/진로개발/창업': '취업',
  생활관: '시설',
  시설: '시설',
  일반: '시설',
  입찰구매정보: '시설',
  학사: '학사',
};

const CATEGORY_TONE_MAP: Record<
  string,
  ContentDetailViewData['metaBadges'][number]['tone']
> = {
  시설: 'gray',
  장학: 'purple',
  취업: 'orange',
  행사: 'pink',
  학사: 'blue',
};

const RECENT_NOTICE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const formatNoticeDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const toCategoryLabel = (category: string) =>
  CATEGORY_DISPLAY_LABEL_MAP[category] ?? category;

const getCategoryTone = (
  categoryLabel: string,
): ContentDetailViewData['metaBadges'][number]['tone'] =>
  CATEGORY_TONE_MAP[categoryLabel] ?? 'gray';

const flattenComments = (
  comments: NoticeCommentTreeNode[],
): NoticeCommentTreeNode[] =>
  comments.flatMap(comment => [comment, ...flattenComments(comment.replies)]);

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

const buildBodyBlocks = (notice: Notice): ContentDetailBodyBlockViewData[] => {
  const html = normalizeNoticeHtml(notice.contentDetail || notice.content || '');

  if (!html.trim()) {
    return [
      {
        id: `${notice.id}-body-1`,
        text: notice.title,
        type: 'paragraph' as const,
      },
    ];
  }

  const tokenized = html
    .replace(
      /<img[^>]*src=["']([^"']+)["'][^>]*>/gi,
      (_match, imageUrl) => `\n[[IMG:${imageUrl}]]\n`,
    )
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|h[1-6])>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const blocks = tokenized
    .split(/(\[\[IMG:[^\]]+\]\])/g)
    .reduce<ContentDetailBodyBlockViewData[]>((accumulator, segment, index) => {
      const imageMatch = segment.match(/^\[\[IMG:(.+)\]\]$/);

      if (imageMatch) {
        accumulator.push({
          id: `${notice.id}-image-${index + 1}`,
          imageUrl: imageMatch[1] ?? '',
          type: 'image',
        });
        return accumulator;
      }

      decodeHtmlEntities(segment)
        .split(/\n{2,}/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean)
        .forEach((paragraph, paragraphIndex) => {
          accumulator.push({
            id: `${notice.id}-paragraph-${index + 1}-${paragraphIndex + 1}`,
            text: paragraph,
            type: 'paragraph',
          });
        });

      return accumulator;
    }, []);

  return blocks.length > 0
    ? blocks
    : [
        {
          id: `${notice.id}-body-fallback`,
          text: notice.content,
          type: 'paragraph' as const,
        },
      ];
};

const isRecentNotice = (postedAt: unknown) => {
  const millis = new Date(String(postedAt)).getTime();

  return Number.isFinite(millis) && Date.now() - millis <= RECENT_NOTICE_WINDOW_MS;
};

const getCommentAuthorLabel = (comment: NoticeCommentTreeNode) => {
  if (!comment.isAnonymous) {
    return comment.userDisplayName;
  }

  return `익명${comment.anonymousOrder ?? ''}`;
};

const toViewData = (
  notice: Notice,
  comments: NoticeCommentTreeNode[],
): ContentDetailViewData => {
  const categoryLabel = toCategoryLabel(notice.category);

  return {
    attachments: notice.contentAttachments.map((attachment, index) => ({
      fileName: attachment.name,
      id: `${notice.id}-attachment-${index + 1}`,
      sizeLabel: '첨부파일',
    })),
    bodyBlocks: buildBodyBlocks(notice),
    commentInputPlaceholder: '댓글을 입력하세요...',
    comments: flattenComments(comments).map(comment => ({
      authorLabel: getCommentAuthorLabel(comment),
      body: comment.content,
      dateLabel: formatNoticeDateLabel(comment.createdAt.toISOString()),
      id: comment.id,
      likeCount: 0,
    })),
    dateLabel: formatNoticeDateLabel(String(notice.postedAt)),
    emptyCommentsLabel: '첫 댓글을 남겨보세요!',
    metaBadges: [
      {
        id: `${notice.id}-category`,
        label: categoryLabel,
        tone: getCategoryTone(categoryLabel),
      },
      ...(isRecentNotice(notice.postedAt)
        ? [
            {
              id: `${notice.id}-new`,
              label: 'NEW',
              tone: 'green' as const,
            },
          ]
        : []),
    ],
    reactions: [
      {
        count: notice.likeCount ?? 0,
        iconName: notice.isLiked ? 'heart' : 'heart-outline',
        id: `${notice.id}-likes`,
      },
    ],
    title: notice.title,
  };
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '공지사항을 다시 불러와주세요.';
};

export const useNoticeDetailData = (noticeId?: string) => {
  const {user} = useAuth();
  const noticeRepository = useNoticeRepository();
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [comments, setComments] = React.useState<NoticeCommentTreeNode[]>([]);
  const [commentDraft, setCommentDraft] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [togglingLike, setTogglingLike] = React.useState(false);
  const [submittingComment, setSubmittingComment] = React.useState(false);
  const requestIdRef = React.useRef(0);

  const loadDetail = React.useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    setLoading(true);

    try {
      if (!noticeId) {
        setNotice(null);
        setComments([]);
        setNotFound(true);
        setError(null);
        return;
      }

      const [nextNotice, nextComments] = await Promise.all([
        noticeRepository.getNotice(noticeId),
        noticeRepository.getComments(noticeId),
      ]);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!nextNotice) {
        setNotice(null);
        setComments([]);
        setNotFound(true);
        setError(null);
        return;
      }

      setNotice(nextNotice);
      setComments(nextComments);
      setNotFound(false);
      setError(null);
    } catch (loadError) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(loadError));
      setNotice(null);
      setComments([]);
      setNotFound(false);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [noticeId, noticeRepository]);

  React.useEffect(() => {
    loadDetail().catch(() => undefined);
  }, [loadDetail]);

  React.useEffect(() => {
    if (!noticeId || !user?.uid || !notice || notice.isRead) {
      return;
    }

    noticeRepository
      .markAsRead(user.uid, noticeId)
      .then(() => {
        setNotice(currentNotice =>
          currentNotice
            ? {
                ...currentNotice,
                isRead: true,
              }
            : currentNotice,
        );
      })
      .catch(markError => {
        console.error('공지사항 읽음 처리 실패:', markError);
      });
  }, [notice, noticeId, noticeRepository, user?.uid]);

  const toggleLike = React.useCallback(async () => {
    if (!noticeId || !user?.uid || togglingLike) {
      throw new Error('로그인이 필요합니다.');
    }

    setTogglingLike(true);

    try {
      const nextIsLiked = await noticeRepository.toggleLike(noticeId, user.uid);
      setNotice(currentNotice => {
        if (!currentNotice) {
          return currentNotice;
        }

        const previousIsLiked = Boolean(currentNotice.isLiked);
        const likeDelta =
          previousIsLiked === nextIsLiked ? 0 : nextIsLiked ? 1 : -1;

        return {
          ...currentNotice,
          isLiked: nextIsLiked,
          likeCount: Math.max(0, (currentNotice.likeCount ?? 0) + likeDelta),
        };
      });
    } finally {
      setTogglingLike(false);
    }
  }, [noticeId, noticeRepository, togglingLike, user?.uid]);

  const submitComment = React.useCallback(async () => {
    if (!noticeId || !user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    const trimmedComment = commentDraft.trim();
    if (!trimmedComment) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    setSubmittingComment(true);

    try {
      await noticeRepository.createComment(noticeId, {
        content: trimmedComment,
        isAnonymous: false,
        parentId: null,
        userDisplayName: user.displayName ?? '익명',
        userId: user.uid,
      });

      const nextComments = await noticeRepository.getComments(noticeId);
      setComments(nextComments);
      setCommentDraft('');
      setNotice(currentNotice =>
        currentNotice
          ? {
              ...currentNotice,
              commentCount: flattenComments(nextComments).length,
            }
          : currentNotice,
      );
    } finally {
      setSubmittingComment(false);
    }
  }, [commentDraft, noticeId, noticeRepository, user]);

  const data = React.useMemo(
    () => (notice ? toViewData(notice, comments) : null),
    [comments, notice],
  );

  return {
    commentDraft,
    data,
    error,
    loading,
    notice,
    notFound,
    reload: loadDetail,
    setCommentDraft,
    submitComment,
    submittingComment,
    toggleLike,
    togglingLike,
  };
};

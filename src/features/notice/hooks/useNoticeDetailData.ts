import React from 'react';

import type {
  ContentDetailBodyBlockViewData,
  ContentDetailViewData,
} from '@/shared/types/contentDetailViewData';

import {normalizeNoticeHtml} from '../model/selectors';
import type {Notice, NoticeCommentTreeNode} from '../model/types';
import {useNoticeComments} from './useNoticeComments';
import {useNoticeDetail} from './useNoticeDetail';

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
      authorLabel: comment.isAnonymous
        ? `익명${comment.anonymousOrder ?? ''}`
        : comment.userDisplayName,
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
        iconName: 'heart-outline',
        id: `${notice.id}-likes`,
      },
      {
        count: 0,
        iconName: 'bookmark-outline',
        id: `${notice.id}-bookmarks`,
      },
    ],
    title: notice.title,
  };
};

export const useNoticeDetailData = (noticeId?: string) => {
  const {error: detailError, loading: detailLoading, notice, refresh} =
    useNoticeDetail(noticeId);
  const {
    comments,
    error: commentsError,
    loading: commentsLoading,
  } = useNoticeComments(noticeId ?? '');

  const data = React.useMemo(
    () => (notice ? toViewData(notice, comments) : null),
    [comments, notice],
  );

  const error = detailError ?? commentsError ?? null;
  const loading =
    detailLoading || (Boolean(noticeId) && commentsLoading && !notice);
  const notFound = !loading && !error && !notice;
  const reload = React.useCallback(async () => {
    refresh();
  }, [refresh]);

  return {
    data,
    error,
    loading,
    notFound,
    reload,
  };
};

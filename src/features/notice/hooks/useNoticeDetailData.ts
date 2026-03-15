import React from 'react';

import type {ContentDetailViewData} from '@/shared/types/contentDetailViewData';

import type {NoticeDetailSourceItem} from '../model/noticeDetailData';
import {noticeDetailRepository} from '../data/repositories/noticeDetailRepository';

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

const CATEGORY_TONE_MAP: Record<string, ContentDetailViewData['metaBadges'][number]['tone']> =
  {
    시설: 'gray',
    장학: 'purple',
    취업: 'orange',
    행사: 'pink',
    학사: 'blue',
  };

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

const toCategoryLabel = (category: string) => {
  return CATEGORY_DISPLAY_LABEL_MAP[category] ?? category;
};

const getCategoryTone = (
  categoryLabel: string,
): ContentDetailViewData['metaBadges'][number]['tone'] => {
  return CATEGORY_TONE_MAP[categoryLabel] ?? 'gray';
};

const toViewData = (notice: NoticeDetailSourceItem): ContentDetailViewData => {
  const categoryLabel = toCategoryLabel(notice.category);

  return {
    attachments: notice.attachments.map(attachment => ({
      fileName: attachment.fileName,
      id: attachment.id,
      sizeLabel: attachment.sizeLabel,
    })),
    bodyBlocks: notice.bodyBlocks,
    commentInputPlaceholder: '댓글을 입력하세요...',
    comments: notice.comments.map(comment => ({
      authorLabel: comment.authorName,
      body: comment.content,
      dateLabel: formatNoticeDateLabel(comment.postedAt),
      id: comment.id,
      likeCount: comment.likeCount,
    })),
    dateLabel: formatNoticeDateLabel(notice.postedAt),
    emptyCommentsLabel: '첫 댓글을 남겨보세요!',
    metaBadges: [
      {
        id: `${notice.id}-category`,
        label: categoryLabel,
        tone: getCategoryTone(categoryLabel),
      },
      ...(notice.isNew
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
        count: notice.likeCount,
        iconName: 'heart-outline',
        id: `${notice.id}-likes`,
      },
      {
        count: notice.bookmarkCount,
        iconName: 'bookmark-outline',
        id: `${notice.id}-bookmarks`,
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
      if (!noticeId) {
        setData(null);
        setNotFound(true);
        setError(null);
        return;
      }

      const notice = await noticeDetailRepository.getNoticeDetail(noticeId);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!notice) {
        setData(null);
        setNotFound(true);
        setError(null);
        return;
      }

      setData(toViewData(notice));
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
  }, [noticeId]);

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

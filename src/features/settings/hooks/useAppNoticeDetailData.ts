import React from 'react';

import {appNoticeScreenRepository} from '../data/repositories/appNoticeScreenRepository';
import type {
  AppNoticeBadgeViewData,
  AppNoticeDetailViewData,
} from '../model/appNoticeViewData';

interface UseAppNoticeDetailDataResult {
  data: AppNoticeDetailViewData | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const buildBadges = (
  important: boolean,
  categoryLabel: string,
): AppNoticeBadgeViewData[] => {
  const badges: AppNoticeBadgeViewData[] = [];

  if (important) {
    badges.push({
      id: 'important',
      label: '중요',
      tone: 'danger',
    });
  }

  badges.push({
    id: 'category',
    label: categoryLabel,
    tone: 'neutral',
  });

  return badges;
};

export const useAppNoticeDetailData = (
  noticeId: string | undefined,
): UseAppNoticeDetailDataResult => {
  const [data, setData] = React.useState<AppNoticeDetailViewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!noticeId) {
      setData(null);
      setError('앱 공지사항 ID가 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const record = await appNoticeScreenRepository.getNotice(noticeId);

      if (!record) {
        setData(null);
        setError('앱 공지사항을 찾을 수 없습니다.');
        return;
      }

      setData({
        authorLabel: record.authorLabel,
        badges: buildBadges(record.important, record.categoryLabel),
        bodyParagraphs: [...record.bodyParagraphs],
        categoryLabel: record.categoryLabel,
        galleryImages: [...record.galleryImages],
        id: record.id,
        publishedLabel: record.detailPublishedLabel,
        title: record.title,
        viewCountLabel: record.viewCountLabel,
      });
    } catch (loadError) {
      console.error('앱 공지사항 상세를 불러오지 못했습니다.', loadError);
      setData(null);
      setError('앱 공지사항을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [noticeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    error,
    loading,
    reload: load,
  };
};

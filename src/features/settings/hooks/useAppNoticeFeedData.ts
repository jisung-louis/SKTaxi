import React from 'react';

import {appNoticeScreenRepository} from '../data/repositories/appNoticeScreenRepository';
import type {
  AppNoticeBadgeViewData,
  AppNoticeFeedViewData,
} from '../model/appNoticeViewData';

interface UseAppNoticeFeedDataResult {
  data: AppNoticeFeedViewData | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const buildBadges = (important: boolean): AppNoticeBadgeViewData[] => {
  if (!important) {
    return [];
  }

  return [
    {
      id: 'important',
      label: '중요',
      tone: 'danger',
    },
  ];
};

export const useAppNoticeFeedData = (): UseAppNoticeFeedDataResult => {
  const [data, setData] = React.useState<AppNoticeFeedViewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const records = await appNoticeScreenRepository.getNotices();
      setData({
        items: records.map(record => ({
          badges: buildBadges(record.important),
          id: record.id,
          previewImage: record.galleryImages[0],
          publishedLabel: record.feedPublishedLabel,
          summary: record.summary,
          title: record.title,
          viewCountLabel: record.viewCountLabel,
        })),
      });
    } catch (loadError) {
      console.error('앱 공지사항 목록을 불러오지 못했습니다.', loadError);
      setError('앱 공지사항을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

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

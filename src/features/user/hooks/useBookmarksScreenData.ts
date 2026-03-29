import React from 'react';

import {useUserActivityRepository} from '@/di';
import {toBookmarksViewData} from '../model/userActivityMappers';
import type {BookmarksScreenViewData} from '../model/userActivityViewData';

export const useBookmarksScreenData = () => {
  const userActivityRepository = useUserActivityRepository();
  const [data, setData] = React.useState<BookmarksScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await userActivityRepository.getBookmarks();
      setData(toBookmarksViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch bookmarks data', caughtError);
      setError('북마크를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userActivityRepository]);

  React.useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  return {
    data,
    error,
    loading,
    reload,
  };
};

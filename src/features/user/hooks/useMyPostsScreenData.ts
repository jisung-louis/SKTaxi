import React from 'react';

import {useUserActivityRepository} from '@/di';
import {toMyPostsViewData} from '../model/userActivityMappers';
import type {MyPostsScreenViewData} from '../model/userActivityViewData';

export const useMyPostsScreenData = () => {
  const userActivityRepository = useUserActivityRepository();
  const [data, setData] = React.useState<MyPostsScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await userActivityRepository.getMyPosts();
      setData(toMyPostsViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch my posts data', caughtError);
      setError('내가 쓴 글을 불러오지 못했습니다.');
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

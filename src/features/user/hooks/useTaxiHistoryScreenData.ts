import React from 'react';

import {useUserActivityRepository} from '@/di';
import {toTaxiHistoryViewData} from '../model/userActivityMappers';
import type {TaxiHistoryScreenViewData} from '../model/userActivityViewData';

export const useTaxiHistoryScreenData = () => {
  const userActivityRepository = useUserActivityRepository();
  const [data, setData] = React.useState<TaxiHistoryScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await userActivityRepository.getTaxiHistory();
      setData(toTaxiHistoryViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch taxi history data', caughtError);
      setError('택시 이용 내역을 불러오지 못했습니다.');
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

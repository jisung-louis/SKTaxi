import {useCallback, useEffect, useState} from 'react';

import {useRepository} from '@/di/useRepository';
import {useAuth} from '@/features/auth';

import {loadCampusHomeQueryResult} from '../application/campusHomeQuery';
import type {CampusHomeViewData} from '../model/campusHome';

export interface UseCampusHomeViewDataResult {
  data: CampusHomeViewData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCampusHomeViewData = (): UseCampusHomeViewDataResult => {
  const {
    academicRepository,
    campusBannerRepository,
    cafeteriaRepository,
    courseRepository,
    noticeRepository,
    timetableRepository,
  } = useRepository();
  const {user} = useAuth();
  const effectiveUserId = user?.uid ?? 'current-user';

  const [data, setData] = useState<CampusHomeViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampusHomeViewData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loadCampusHomeQueryResult({
        academicRepository,
        campusBannerRepository,
        cafeteriaRepository,
        courseRepository,
        currentUserId: effectiveUserId,
        noticeRepository,
        timetableRepository,
      });
      setData(result);
    } catch (err) {
      console.error('캠퍼스 홈 데이터 조회 실패:', err);
      setError('캠퍼스 화면을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    academicRepository,
    campusBannerRepository,
    cafeteriaRepository,
    courseRepository,
    effectiveUserId,
    noticeRepository,
    timetableRepository,
  ]);

  useEffect(() => {
    loadCampusHomeViewData();
  }, [loadCampusHomeViewData]);

  return {
    data,
    loading,
    error,
    refetch: loadCampusHomeViewData,
  };
};

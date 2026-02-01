// SKTaxi: 앱 공지사항 목록 훅 (Repository 패턴 적용)

import { useState, useEffect } from 'react';
import { useAppNoticeRepository } from '../../di/useRepository';
import { AppNotice } from '../../repositories/interfaces/IAppNoticeRepository';

export interface UseAppNoticesResult {
  /** 앱 공지사항 목록 */
  notices: AppNotice[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 앱 공지사항 목록을 조회하는 훅
 * 실시간 구독 지원
 */
export function useAppNotices(): UseAppNoticesResult {
  const appNoticeRepository = useAppNoticeRepository();

  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = appNoticeRepository.subscribeToAppNotices({
      onData: (loadedNotices) => {
        setNotices(loadedNotices);
        setLoading(false);
        setError(null);
      },
      onError: (err) => {
        console.error('앱 공지사항 목록 로드 실패:', err);
        setError('공지사항을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [appNoticeRepository]);

  return {
    notices,
    loading,
    error,
  };
}

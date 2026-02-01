// SKTaxi: 단일 앱 공지사항 조회 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useAppNoticeRepository } from '../../di/useRepository';
import { AppNotice } from '../../repositories/interfaces/IAppNoticeRepository';

export interface UseAppNoticeResult {
  /** 앱 공지사항 데이터 */
  notice: AppNotice | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 새로고침 함수 */
  refresh: () => void;
}

/**
 * 단일 앱 공지사항을 조회하는 훅
 */
export function useAppNotice(noticeId: string | undefined): UseAppNoticeResult {
  const appNoticeRepository = useAppNoticeRepository();

  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotice = useCallback(async () => {
    if (!noticeId) {
      setLoading(false);
      setError('공지사항 ID가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const loadedNotice = await appNoticeRepository.getAppNotice(noticeId);
      if (loadedNotice) {
        setNotice(loadedNotice);
      } else {
        setError('공지사항을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('앱 공지사항 로드 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [noticeId, appNoticeRepository]);

  useEffect(() => {
    loadNotice();
  }, [loadNotice]);

  return {
    notice,
    loading,
    error,
    refresh: loadNotice,
  };
}

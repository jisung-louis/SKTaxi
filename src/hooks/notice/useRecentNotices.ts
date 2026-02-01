// SKTaxi: 최근 공지사항 조회 훅 (Repository 패턴)
// HomeScreen의 NoticeSection에서 사용

import { useState, useEffect, useCallback } from 'react';
import { useNoticeRepository } from '../../di/useRepository';
import { Notice } from '../../repositories/interfaces/INoticeRepository';

export interface UseRecentNoticesResult {
  /** 최근 공지사항 목록 */
  notices: Notice[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 수동 새로고침 */
  refresh: () => Promise<void>;
}

/**
 * 최근 공지사항 조회 훅
 * @param limit - 가져올 공지사항 수 (기본값: 10)
 */
export function useRecentNotices(limit: number = 10): UseRecentNoticesResult {
  const noticeRepository = useNoticeRepository();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await noticeRepository.getRecentNotices(limit);
      setNotices(result);
    } catch (err: any) {
      console.error('최근 공지사항 조회 실패:', err);
      setError(err.message || '공지사항을 불러오지 못했습니다.');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [noticeRepository, limit]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    notices,
    loading,
    error,
    refresh: fetchNotices,
  };
}

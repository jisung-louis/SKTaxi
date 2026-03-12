import { useState, useEffect, useCallback } from 'react';

import type { Notice } from '../model/types';
import { useNoticeRepository } from './useNoticeRepository';

export interface UseNoticeResult {
  /** 공지사항 데이터 */
  notice: Notice | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 새로고침 함수 */
  refresh: () => void;
}

export function useNotice(noticeId: string | undefined): UseNoticeResult {
  const noticeRepository = useNoticeRepository();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotice = useCallback(async () => {
    if (!noticeId) {
      setLoading(false);
      setError('잘못된 접근입니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const nextNotice = await noticeRepository.getNotice(noticeId);
      if (!nextNotice) {
        setError('공지사항을 찾을 수 없습니다.');
        setNotice(null);
        return;
      }

      setNotice(nextNotice);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [noticeId, noticeRepository]);

  // 실시간 구독
  useEffect(() => {
    if (!noticeId) {
      setLoading(false);
      setError('잘못된 접근입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = noticeRepository.subscribeToNotice(noticeId, {
      onData: (nextNotice) => {
        setNotice(nextNotice);
        setLoading(false);
        if (!nextNotice) {
          setError('공지사항을 찾을 수 없습니다.');
        } else {
          setError(null);
        }
      },
      onError: (err) => {
        console.error('공지사항 실시간 구독 실패:', err);
        setError('공지사항을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [noticeId, noticeRepository]);

  return {
    notice,
    loading,
    error,
    refresh: loadNotice,
  };
}

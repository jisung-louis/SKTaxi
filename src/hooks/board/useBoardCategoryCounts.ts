// SKTaxi: 게시판 카테고리별 게시물 수 조회 훅 (Repository 패턴)
// BoardHeader에서 카테고리별 게시물 수 표시에 사용

import { useState, useEffect, useCallback } from 'react';
import { useBoardRepository } from '../../di/useRepository';
import { BOARD_CATEGORIES } from '../../constants/board';

export interface UseBoardCategoryCountsResult {
  /** 카테고리별 게시물 수 (key: categoryId, value: count) */
  counts: Record<string, number>;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 수동 새로고침 */
  refresh: () => Promise<void>;
}

/**
 * 게시판 카테고리별 게시물 수 조회 훅
 */
export function useBoardCategoryCounts(): UseBoardCategoryCountsResult {
  const boardRepository = useBoardRepository();

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryIds = BOARD_CATEGORIES.map(cat => cat.id);
      const result = await boardRepository.getCategoryCounts(categoryIds);
      setCounts(result);
    } catch (err: any) {
      console.error('카테고리별 게시물 수 조회 실패:', err);
      setError(err.message || '카테고리별 게시물 수를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardRepository]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refresh: fetchCounts,
  };
}

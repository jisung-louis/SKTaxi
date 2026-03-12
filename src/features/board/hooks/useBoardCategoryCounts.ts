import { useCallback, useEffect, useState } from 'react';

import { BOARD_CATEGORIES } from '../model/constants';
import { useBoardRepository } from './useBoardRepository';

export interface UseBoardCategoryCountsResult {
  counts: Record<string, number>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBoardCategoryCounts(): UseBoardCategoryCountsResult {
  const boardRepository = useBoardRepository();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryIds = BOARD_CATEGORIES.map((category) => category.id);
      setCounts(await boardRepository.getCategoryCounts(categoryIds));
    } catch (err) {
      console.error('카테고리별 게시물 수 조회 실패:', err);
      setError(
        err instanceof Error
          ? err.message
          : '카테고리별 게시물 수를 불러오지 못했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, [boardRepository]);

  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refresh: fetchCounts,
  };
}

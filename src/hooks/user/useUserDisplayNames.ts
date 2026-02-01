// SKTaxi: 사용자 표시 이름 조회 훅 (Repository 패턴)
// 여러 uid에 대한 displayName 맵을 제공

import { useState, useEffect, useMemo } from 'react';
import { useUserRepository } from '../../di/useRepository';
import { UserDisplayNameMap } from '../../repositories/interfaces/IUserRepository';

export interface UseUserDisplayNamesResult {
  /** uid -> displayName 맵 */
  displayNameMap: UserDisplayNameMap;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 여러 사용자의 표시 이름을 조회하는 훅
 * @param uids - 조회할 사용자 ID 배열
 */
export function useUserDisplayNames(uids: string[]): UseUserDisplayNamesResult {
  const userRepository = useUserRepository();

  const [displayNameMap, setDisplayNameMap] = useState<UserDisplayNameMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 의존성 안정화를 위해 값 기반 키 생성 (정렬 + join)
  const uidKey = useMemo(() => {
    const uniq = Array.from(new Set((uids || []).filter(Boolean)));
    uniq.sort();
    return uniq.join(',');
  }, [uids]);

  const uniqueUids = useMemo(() => (uidKey ? uidKey.split(',') : []), [uidKey]);

  useEffect(() => {
    if (uniqueUids.length === 0) {
      setDisplayNameMap({});
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchDisplayNames = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await userRepository.getUserDisplayNames(uniqueUids);

        if (!isCancelled) {
          setDisplayNameMap(result);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('사용자 표시 이름 조회 실패:', err);
          setError(err.message || '표시 이름을 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchDisplayNames();

    return () => {
      isCancelled = true;
    };
  }, [uniqueUids, userRepository]);

  return {
    displayNameMap,
    loading,
    error,
  };
}

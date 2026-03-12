import { useEffect, useMemo, useState } from 'react';

import { UserDisplayNameMap } from '../model/types';
import { useUserRepository } from './useUserRepository';

export interface UseUserDisplayNamesResult {
  displayNameMap: UserDisplayNameMap;
  loading: boolean;
  error: string | null;
}

export function useUserDisplayNames(
  uids: string[],
): UseUserDisplayNamesResult {
  const userRepository = useUserRepository();

  const [displayNameMap, setDisplayNameMap] = useState<UserDisplayNameMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uidKey = useMemo(() => {
    const uniqueIds = Array.from(new Set((uids || []).filter(Boolean)));
    uniqueIds.sort();
    return uniqueIds.join(',');
  }, [uids]);

  const uniqueUids = useMemo(
    () => (uidKey ? uidKey.split(',') : []),
    [uidKey],
  );

  useEffect(() => {
    if (uniqueUids.length === 0) {
      setDisplayNameMap({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDisplayNames = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userRepository.getUserDisplayNames(uniqueUids);

        if (!cancelled) {
          setDisplayNameMap(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('사용자 표시 이름 조회 실패:', err);
          setError(err.message || '표시 이름을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDisplayNames();

    return () => {
      cancelled = true;
    };
  }, [uniqueUids, userRepository]);

  return {
    displayNameMap,
    loading,
    error,
  };
}

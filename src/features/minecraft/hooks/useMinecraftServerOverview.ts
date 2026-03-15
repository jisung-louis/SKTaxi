import { useEffect, useState } from 'react';

import type { MinecraftServerOverview } from '../model/types';
import { subscribeToMinecraftServerOverview } from '../services/minecraftRealtimeService';

const INITIAL_OVERVIEW: MinecraftServerOverview = {
  serverStatus: null,
  serverUrl: null,
  mapUri: null,
  serverVersion: null,
};

export interface UseMinecraftServerOverviewResult
  extends MinecraftServerOverview {
  loading: boolean;
  error: string | null;
}

export const useMinecraftServerOverview =
  (): UseMinecraftServerOverviewResult => {
    const [overview, setOverview] =
      useState<MinecraftServerOverview>(INITIAL_OVERVIEW);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const unsubscribe = subscribeToMinecraftServerOverview({
        onData: nextOverview => {
          setOverview(nextOverview);
          setLoading(false);
          setError(null);
        },
        onError: nextError => {
          console.error('마인크래프트 서버 정보 구독 실패:', nextError);
          setOverview(INITIAL_OVERVIEW);
          setLoading(false);
          setError('마인크래프트 서버 정보를 불러오지 못했습니다.');
        },
      });

      return () => unsubscribe();
    }, []);

    return {
      ...overview,
      loading,
      error,
    };
  };

import {useEffect, useMemo, useState} from 'react';

import {useMemberDirectoryRepository} from '@/di';

import type {MinecraftWhitelistPlayer} from '../model/types';
import {subscribeToMinecraftWhitelistPlayers} from '../services/minecraftRealtimeService';

export type MinecraftWhitelistPlayerWithMeta = MinecraftWhitelistPlayer & {
  addedByDisplayName: string;
};

export interface UseMinecraftWhitelistPlayersResult {
  players: MinecraftWhitelistPlayerWithMeta[];
  loading: boolean;
  fetchingUsers: boolean;
  error: string | null;
}

export const useMinecraftWhitelistPlayers =
  (): UseMinecraftWhitelistPlayersResult => {
    const memberDirectoryRepository = useMemberDirectoryRepository();
    const [rawPlayers, setRawPlayers] = useState<MinecraftWhitelistPlayer[]>(
      [],
    );
    const [userCache, setUserCache] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const unsubscribe = subscribeToMinecraftWhitelistPlayers({
        onData: nextPlayers => {
          setRawPlayers(nextPlayers);
          setLoading(false);
          setError(null);
        },
        onError: nextError => {
          console.error('마인크래프트 멤버 목록 구독 실패:', nextError);
          setRawPlayers([]);
          setLoading(false);
          setError('마인크래프트 멤버 목록을 불러오지 못했습니다.');
        },
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      const missingUserIds = Array.from(
        new Set(rawPlayers.map(player => player.addedBy)),
      ).filter(uid => uid && !userCache[uid]);

      if (missingUserIds.length === 0) {
        return;
      }

      setFetchingUsers(true);

      memberDirectoryRepository
        .getMemberDisplayNames(missingUserIds)
        .then(displayNameMap => {
          setUserCache(prev => ({
            ...prev,
            ...displayNameMap,
          }));
        })
        .catch(nextError => {
          console.error('마인크래프트 멤버 표시 이름 조회 실패:', nextError);
        })
        .finally(() => setFetchingUsers(false));
    }, [memberDirectoryRepository, rawPlayers, userCache]);

    const players = useMemo(() => {
      return rawPlayers.map(player => ({
        ...player,
        addedByDisplayName: userCache[player.addedBy] || '알 수 없음',
      }));
    }, [rawPlayers, userCache]);

    return {
      players,
      loading,
      fetchingUsers,
      error,
    };
  };

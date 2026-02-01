// SKTaxi: 공지사항 훅 - Repository 패턴 적용
// 공지 목록, 읽음 상태, 페이지네이션 관리

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNoticeRepository, useUserRepository } from '../../di';
import { Notice, ReadStatusMap } from '../../repositories/interfaces/INoticeRepository';
import { useAuth } from '../auth';

const NOTICES_PER_PAGE = 20;

export interface UseNoticesResult {
  notices: Notice[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  readStatus: ReadStatusMap;
  readStatusLoading: boolean;
  markAsRead: (noticeId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refreshReadStatus: () => Promise<void>;
  userJoinedAt: unknown;
  userJoinedAtLoaded: boolean;
}

/**
 * 공지사항 훅 - Repository 패턴 사용
 *
 * @param selectedCategory - 선택된 카테고리 ('전체' 또는 특정 카테고리)
 * @returns 공지 목록 및 읽음 상태
 */
export function useNotices(selectedCategory: string = '전체'): UseNoticesResult {
  const noticeRepository = useNoticeRepository();
  const userRepository = useUserRepository();
  const { user } = useAuth();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [readStatus, setReadStatus] = useState<ReadStatusMap>({});
  const [readStatusLoading, setReadStatusLoading] = useState(true);
  const [userJoinedAt, setUserJoinedAt] = useState<unknown>(null);
  const [userJoinedAtLoaded, setUserJoinedAtLoaded] = useState(false);

  // 카테고리별 캐시
  const [categoryCache, setCategoryCache] = useState<
    Record<
      string,
      {
        items: Notice[];
        cursor: unknown;
        hasMore: boolean;
        initialized: boolean;
      }
    >
  >({});

  const cursorRef = useRef<unknown>(null);
  const isMountedRef = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const categoryCacheRef = useRef(categoryCache);

  // 사용자 가입 시각 로드
  useEffect(() => {
    const loadUserJoinedAt = async () => {
      if (!user?.uid) {
        setUserJoinedAt(null);
        setUserJoinedAtLoaded(true);
        return;
      }

      try {
        const profile = await userRepository.getUserProfile(user.uid);
        setUserJoinedAt(profile?.joinedAt || null);
      } catch (err) {
        console.error('사용자 가입 시각 로드 실패:', err);
        setUserJoinedAt(null);
      } finally {
        setUserJoinedAtLoaded(true);
      }
    };

    loadUserJoinedAt();
  }, [user?.uid, userRepository]);

  // categoryCache ref 동기화
  useEffect(() => {
    categoryCacheRef.current = categoryCache;
  }, [categoryCache]);

  // 공지사항 로드 및 구독
  useEffect(() => {
    isMountedRef.current = true;
    const catKey = selectedCategory || '전체';

    // 캐시 확인 (ref 사용으로 무한 루프 방지)
    const cached = categoryCacheRef.current[catKey];
    if (cached?.initialized) {
      setNotices(cached.items);
      cursorRef.current = cached.cursor;
      setHasMore(cached.hasMore);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    // 기존 구독 해제
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // 실시간 구독 시작
    unsubscribeRef.current = noticeRepository.subscribeToNotices(
      catKey,
      NOTICES_PER_PAGE,
      {
        onData: (noticesData: Notice[]) => {
          if (!isMountedRef.current) {return;}

          // 캐시 업데이트
          setCategoryCache((prev) => ({
            ...prev,
            [catKey]: {
              items: noticesData,
              cursor: noticesData.length > 0 ? noticesData[noticesData.length - 1] : null,
              hasMore: noticesData.length === NOTICES_PER_PAGE,
              initialized: true,
            },
          }));

          setNotices(noticesData);
          cursorRef.current =
            noticesData.length > 0 ? noticesData[noticesData.length - 1] : null;
          setHasMore(noticesData.length === NOTICES_PER_PAGE);
          setLoading(false);
          setError(null);
        },
        onError: (err: Error) => {
          if (!isMountedRef.current) {return;}
          console.error('공지사항 로드 실패:', err);
          setError(err.message);
          setLoading(false);
        },
      }
    );

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedCategory, noticeRepository]);

  // 읽음 상태 로드
  useEffect(() => {
    const loadReadStatus = async () => {
      if (!user?.uid || notices.length === 0) {
        setReadStatusLoading(false);
        return;
      }

      setReadStatusLoading(true);

      try {
        // 기존 읽음 상태 보존
        const statusMap: ReadStatusMap = { ...readStatus };

        // 가입일 이전 공지는 읽음 처리
        const joinedTs =
          typeof (userJoinedAt as any)?.toMillis === 'function'
            ? (userJoinedAt as any).toMillis()
            : Number(userJoinedAt || 0);

        if (joinedTs) {
          notices.forEach((n) => {
            const postedTs =
              typeof (n.postedAt as any)?.toMillis === 'function'
                ? (n.postedAt as any).toMillis()
                : Number(n.postedAt || 0);
            if (postedTs && postedTs <= joinedTs) {
              statusMap[n.id] = true;
            }
          });
        }

        // 서버에서 읽음 상태 조회
        const noticeIds = notices
          .filter((n) => !statusMap[n.id])
          .map((n) => n.id);

        if (noticeIds.length > 0) {
          const serverStatus = await noticeRepository.getReadStatus(user.uid, noticeIds);
          Object.assign(statusMap, serverStatus);
        }

        setReadStatus(statusMap);
      } catch (err) {
        console.error('읽음 상태 로드 실패:', err);
      } finally {
        setReadStatusLoading(false);
      }
    };

    loadReadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices, userJoinedAt, user?.uid, noticeRepository]);

  // 읽음 상태 새로고침
  const refreshReadStatus = useCallback(async () => {
    if (!user?.uid || notices.length === 0) {return;}

    try {
      const noticeIds = notices.map((n) => n.id);
      const serverStatus = await noticeRepository.getReadStatus(user.uid, noticeIds);
      setReadStatus(serverStatus);
    } catch (err) {
      console.error('읽음 상태 새로고침 실패:', err);
    }
  }, [user?.uid, notices, noticeRepository]);

  // 더 많은 공지 로드
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {return;}

    setLoadingMore(true);

    try {
      const catKey = selectedCategory || '전체';
      const result = await noticeRepository.getMoreNotices(
        catKey,
        cursorRef.current,
        NOTICES_PER_PAGE
      );

      if (!isMountedRef.current) {return;}

      if (result.data.length === 0) {
        setHasMore(false);
        setCategoryCache((prev) => ({
          ...prev,
          [catKey]: { ...prev[catKey], hasMore: false },
        }));
        return;
      }

      setNotices((prev) => {
        const merged = [...prev, ...result.data];
        setCategoryCache((prevCache) => ({
          ...prevCache,
          [catKey]: {
            items: merged,
            cursor: result.cursor,
            hasMore: result.hasMore,
            initialized: true,
          },
        }));
        return merged;
      });

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('더 많은 공지사항 로드 실패:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedCategory, noticeRepository]);

  // 읽음 처리
  const markAsRead = useCallback(
    async (noticeId: string) => {
      if (!user?.uid || readStatus[noticeId]) {return;}

      // 가입일 이전 공지 체크
      const notice = notices.find((n) => n.id === noticeId);
      const joinedTs =
        typeof (userJoinedAt as any)?.toMillis === 'function'
          ? (userJoinedAt as any).toMillis()
          : Number(userJoinedAt || 0);
      const postedTs =
        typeof (notice?.postedAt as any)?.toMillis === 'function'
          ? (notice?.postedAt as any).toMillis()
          : Number(notice?.postedAt || 0);

      if (joinedTs && postedTs && postedTs <= joinedTs) {
        // 가입일 이전 공지는 로컬만 업데이트
        setReadStatus((prev) => ({ ...prev, [noticeId]: true }));
        return;
      }

      // 로컬 상태 먼저 업데이트
      setReadStatus((prev) => ({ ...prev, [noticeId]: true }));

      try {
        await noticeRepository.markAsRead(user.uid, noticeId);
      } catch (err) {
        console.error('읽음 처리 실패:', err);
        // 실패 시 롤백
        setReadStatus((prev) => ({ ...prev, [noticeId]: false }));
      }
    },
    [user?.uid, readStatus, notices, userJoinedAt, noticeRepository]
  );

  // 모두 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) {return;}

    const joinedTs =
      typeof (userJoinedAt as any)?.toMillis === 'function'
        ? (userJoinedAt as any).toMillis()
        : Number(userJoinedAt || 0);

    // 읽음 처리할 공지 ID들
    const idsToMark = notices
      .filter((n) => {
        if (readStatus[n.id]) {return false;}
        const postedTs =
          typeof (n.postedAt as any)?.toMillis === 'function'
            ? (n.postedAt as any).toMillis()
            : Number(n.postedAt || 0);
        return !joinedTs || !postedTs || postedTs > joinedTs;
      })
      .map((n) => n.id);

    if (idsToMark.length === 0) {return;}

    try {
      await noticeRepository.markAllAsRead(user.uid, idsToMark);

      // 로컬 상태 업데이트
      setReadStatus((prev) => {
        const next = { ...prev };
        idsToMark.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
    } catch (err) {
      console.error('모두 읽음 처리 실패:', err);
    }
  }, [user?.uid, notices, readStatus, userJoinedAt, noticeRepository]);

  // 읽지 않은 공지 수 계산
  const unreadCount = notices.filter((notice) => {
    if (readStatus[notice.id]) {return false;}
    if (!userJoinedAt) {return true;}

    const joinedTs =
      typeof (userJoinedAt as any)?.toMillis === 'function'
        ? (userJoinedAt as any).toMillis()
        : Number(userJoinedAt || 0);
    const postedTs =
      typeof (notice.postedAt as any)?.toMillis === 'function'
        ? (notice.postedAt as any).toMillis()
        : Number(notice.postedAt || 0);

    return !postedTs || postedTs > joinedTs;
  }).length;

  return {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    unreadCount,
    readStatus,
    readStatusLoading,
    markAsRead,
    markAllAsRead,
    loadMore,
    refreshReadStatus,
    userJoinedAt,
    userJoinedAtLoaded,
  };
}

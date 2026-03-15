import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth';
import { useUserRepository } from '@/features/user';

import type { Notice, ReadStatusMap } from '../model/types';
import { countUnreadNotices, isNoticeRead } from '../model/selectors';
import {
  getNoticeIdsToMarkAllAsRead,
  resolveNoticeReadStatus,
  shouldPersistNoticeReadState,
} from '../services/noticeReadStateService';
import { useNoticeRepository } from './useNoticeRepository';

export interface UseNoticeReadStateResult {
  readStatus: ReadStatusMap;
  readStatusLoading: boolean;
  unreadCount: number;
  markAsRead: (noticeId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshReadStatus: () => Promise<void>;
  userJoinedAt: unknown;
  userJoinedAtLoaded: boolean;
}

export const useNoticeReadState = ({
  notices,
}: {
  notices: Notice[];
}): UseNoticeReadStateResult => {
  const { user } = useAuth();
  const noticeRepository = useNoticeRepository();
  const userRepository = useUserRepository();

  const [readStatus, setReadStatus] = useState<ReadStatusMap>({});
  const [readStatusLoading, setReadStatusLoading] = useState(true);
  const [userJoinedAt, setUserJoinedAt] = useState<unknown>(null);
  const [userJoinedAtLoaded, setUserJoinedAtLoaded] = useState(false);

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
      } catch (error) {
        console.error('사용자 가입 시각 로드 실패:', error);
        setUserJoinedAt(null);
      } finally {
        setUserJoinedAtLoaded(true);
      }
    };

    loadUserJoinedAt();
  }, [user?.uid, userRepository]);

  const refreshReadStatus = useCallback(async () => {
    if (!user?.uid || notices.length === 0) {
      setReadStatus({});
      return;
    }

    try {
      const nextStatus = await resolveNoticeReadStatus({
        notices,
        noticeRepository,
        userId: user.uid,
        userJoinedAt,
      });
      setReadStatus(nextStatus);
    } catch (error) {
      console.error('읽음 상태 새로고침 실패:', error);
    }
  }, [noticeRepository, notices, user?.uid, userJoinedAt]);

  useEffect(() => {
    const loadReadStatus = async () => {
      if (!user?.uid || notices.length === 0) {
        setReadStatus({});
        setReadStatusLoading(false);
        return;
      }

      setReadStatusLoading(true);

      try {
        const nextStatus = await resolveNoticeReadStatus({
          notices,
          noticeRepository,
          previousReadStatus: readStatus,
          userId: user.uid,
          userJoinedAt,
        });
        setReadStatus(nextStatus);
      } catch (error) {
        console.error('읽음 상태 로드 실패:', error);
      } finally {
        setReadStatusLoading(false);
      }
    };

    loadReadStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeRepository, notices, user?.uid, userJoinedAt]);

  const markAsRead = useCallback(async (noticeId: string) => {
    const notice = notices.find((item) => item.id === noticeId);
    if (!user?.uid || !notice || isNoticeRead(notice, readStatus, userJoinedAt)) {
      return;
    }

    setReadStatus((prev) => ({
      ...prev,
      [noticeId]: true,
    }));

    if (!shouldPersistNoticeReadState(notice, userJoinedAt)) {
      return;
    }

    try {
      await noticeRepository.markAsRead(user.uid, noticeId);
    } catch (error) {
      console.error('읽음 처리 실패:', error);
      setReadStatus((prev) => ({
        ...prev,
        [noticeId]: false,
      }));
    }
  }, [noticeRepository, notices, readStatus, user?.uid, userJoinedAt]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) {
      return;
    }

    const noticeIds = getNoticeIdsToMarkAllAsRead({
      notices,
      readStatus,
      userJoinedAt,
    });

    if (noticeIds.length === 0) {
      return;
    }

    try {
      await noticeRepository.markAllAsRead(user.uid, noticeIds);
      setReadStatus((prev) => {
        const nextStatus = { ...prev };
        noticeIds.forEach((noticeId) => {
          nextStatus[noticeId] = true;
        });
        return nextStatus;
      });
    } catch (error) {
      console.error('모두 읽음 처리 실패:', error);
    }
  }, [noticeRepository, notices, readStatus, user?.uid, userJoinedAt]);

  const unreadCount = useMemo(() => {
    return countUnreadNotices(notices, readStatus, userJoinedAt);
  }, [notices, readStatus, userJoinedAt]);

  return {
    readStatus,
    readStatusLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshReadStatus,
    userJoinedAt,
    userJoinedAtLoaded,
  };
};

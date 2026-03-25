import {useCallback, useEffect, useMemo, useState} from 'react';

import {useAuth} from '@/features/auth';

import type {Notice, ReadStatusMap} from '../model/types';
import {countUnreadNotices, isNoticeRead} from '../model/selectors';
import {
  buildNoticeReadStatus,
  getNoticeIdsToMarkAllAsRead,
  shouldPersistNoticeReadState,
} from '../services/noticeReadStateService';
import {useNoticeRepository} from './useNoticeRepository';

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
  const {loading: authLoading, user} = useAuth();
  const noticeRepository = useNoticeRepository();

  const [readStatus, setReadStatus] = useState<ReadStatusMap>({});
  const userJoinedAt = user?.joinedAt ?? null;
  const userJoinedAtLoaded = !authLoading;
  const readStatusLoading = authLoading;

  const refreshReadStatus = useCallback(async () => {
    setReadStatus(currentStatus =>
      buildNoticeReadStatus({
        notices,
        previousReadStatus: currentStatus,
        userJoinedAt,
      }),
    );
  }, [notices, userJoinedAt]);

  useEffect(() => {
    setReadStatus(currentStatus =>
      buildNoticeReadStatus({
        notices,
        previousReadStatus: currentStatus,
        userJoinedAt,
      }),
    );
  }, [notices, userJoinedAt]);

  const markAsRead = useCallback(
    async (noticeId: string) => {
      const notice = notices.find(item => item.id === noticeId);
      if (
        !user?.uid ||
        !notice ||
        isNoticeRead(notice, readStatus, userJoinedAt)
      ) {
        return;
      }

      setReadStatus(prev => ({
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
        setReadStatus(prev => ({
          ...prev,
          [noticeId]: false,
        }));
      }
    },
    [noticeRepository, notices, readStatus, user?.uid, userJoinedAt],
  );

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
      setReadStatus(prev => {
        const nextStatus = {...prev};
        noticeIds.forEach(noticeId => {
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

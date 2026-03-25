import type {INoticeRepository} from '../data/repositories/INoticeRepository';
import type {Notice, ReadStatusMap} from '../model/types';
import {isNoticeRead, toNoticeTimestampMillis} from '../model/selectors';

export const resolveNoticeReadStatus = async ({
  notices,
  noticeRepository,
  previousReadStatus = {},
  userId,
  userJoinedAt,
}: {
  notices: Notice[];
  noticeRepository: INoticeRepository;
  previousReadStatus?: ReadStatusMap;
  userId: string;
  userJoinedAt: unknown;
}): Promise<ReadStatusMap> => {
  const nextStatus: ReadStatusMap = {...previousReadStatus};

  notices.forEach(notice => {
    if (isNoticeRead(notice, nextStatus, userJoinedAt)) {
      nextStatus[notice.id] = true;
    }
  });

  const unreadNoticeIds = notices
    .filter(notice => !nextStatus[notice.id])
    .map(notice => notice.id);

  if (unreadNoticeIds.length === 0) {
    return nextStatus;
  }

  const serverStatus = await noticeRepository.getReadStatus(
    userId,
    unreadNoticeIds,
  );
  return {
    ...nextStatus,
    ...serverStatus,
  };
};

export const buildNoticeReadStatus = ({
  notices,
  previousReadStatus = {},
  userJoinedAt,
}: {
  notices: Notice[];
  previousReadStatus?: ReadStatusMap;
  userJoinedAt: unknown;
}): ReadStatusMap => {
  return notices.reduce<ReadStatusMap>((nextStatus, notice) => {
    if (
      Boolean(notice.isRead) ||
      isNoticeRead(notice, previousReadStatus, userJoinedAt)
    ) {
      nextStatus[notice.id] = true;
    }

    return nextStatus;
  }, {});
};

export const shouldPersistNoticeReadState = (
  notice: Notice | undefined,
  userJoinedAt: unknown,
) => {
  if (!notice) {
    return false;
  }

  const joinedTs = toNoticeTimestampMillis(userJoinedAt);
  const postedTs = toNoticeTimestampMillis(notice.postedAt);

  return !joinedTs || !postedTs || postedTs > joinedTs;
};

export const getNoticeIdsToMarkAllAsRead = ({
  notices,
  readStatus,
  userJoinedAt,
}: {
  notices: Notice[];
  readStatus: ReadStatusMap;
  userJoinedAt: unknown;
}) => {
  return notices
    .filter(notice => !isNoticeRead(notice, readStatus, userJoinedAt))
    .map(notice => notice.id);
};

const viewedNoticeIds = new Set<string>();

export const incrementNoticeDetailView = async ({
  noticeId,
  noticeRepository,
}: {
  noticeId: string | undefined | null;
  noticeRepository: INoticeRepository;
}) => {
  if (!noticeId || viewedNoticeIds.has(noticeId)) {
    return;
  }

  viewedNoticeIds.add(noticeId);

  try {
    await noticeRepository.incrementViewCount(noticeId);
  } catch (error) {
    viewedNoticeIds.delete(noticeId);
    throw error;
  }
};

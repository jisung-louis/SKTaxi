import type { Notice, ReadStatusMap } from './types';

export const toNoticeTimestampMillis = (value: unknown) => {
  if (!value) {
    return 0;
  }

  if (typeof (value as any)?.toMillis === 'function') {
    return (value as any).toMillis();
  }

  if (typeof (value as any)?.toDate === 'function') {
    return (value as any).toDate().getTime();
  }

  const parsed = new Date(value as string | number | Date).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatNoticePostedAt = (postedAt: unknown) => {
  const millis = toNoticeTimestampMillis(postedAt);
  if (!millis) {
    return '';
  }

  try {
    return new Date(millis).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const normalizeNoticeHtml = (html?: string | null) => {
  if (!html) {
    return '';
  }

  return html
    .replace(/src="\/(.*?)"/g, 'src="https://www.sungkyul.ac.kr/$1"')
    .replace(/src="http:\/\//g, 'src="https://');
};

export const isNoticeRead = (
  notice: Notice,
  readStatus: ReadStatusMap,
  userJoinedAt: unknown,
) => {
  if (readStatus[notice.id]) {
    return true;
  }

  const joinedTs = toNoticeTimestampMillis(userJoinedAt);
  const postedTs = toNoticeTimestampMillis(notice.postedAt);

  return Boolean(joinedTs && postedTs && postedTs <= joinedTs);
};

export const countUnreadNotices = (
  notices: Notice[],
  readStatus: ReadStatusMap,
  userJoinedAt: unknown,
) => {
  return notices.filter((notice) => !isNoticeRead(notice, readStatus, userJoinedAt)).length;
};

export const getUnreadNoticeBannerText = ({
  selectedCategory,
  unreadCount,
}: {
  selectedCategory: string;
  unreadCount: number;
}) => {
  if (unreadCount > 0) {
    return selectedCategory === '전체'
      ? `읽지 않은 공지사항 ${unreadCount}개`
      : `읽지 않은 ${selectedCategory} 공지 ${unreadCount}개`;
  }

  return selectedCategory === '전체'
    ? '모든 공지를 읽었습니다'
    : `${selectedCategory} 공지를 모두 읽었습니다`;
};

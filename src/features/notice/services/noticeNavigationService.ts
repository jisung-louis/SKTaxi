import type { NoticeForegroundNotificationPayload } from '../model/types';

export const navigateToNoticeDetail = (navigation: any, noticeId: string) => {
  try {
    navigation.navigate('Main', {
      screen: 'NoticeTab',
      params: {
        screen: 'NoticeDetail',
        params: { noticeId },
      },
    });
    return;
  } catch {}

  try {
    navigation.navigate('NoticeTab', {
      screen: 'NoticeDetail',
      params: { noticeId },
    });
  } catch {}
};

export const buildNoticeForegroundNotification = ({
  noticeCategory,
  noticeId,
  noticeTitle,
}: {
  noticeId: string;
  noticeTitle?: string;
  noticeCategory?: string;
}): NoticeForegroundNotificationPayload => {
  const title = noticeTitle || '새로운 공지사항';
  const category = noticeCategory || '일반';

  return {
    noticeId,
    title: `새 성결대 ${category} 공지`,
    body: title,
    type: 'notice',
  };
};

export const buildNoticePushForegroundNotification = (data: {
  noticeId: string;
  title: string;
  body: string;
}): NoticeForegroundNotificationPayload => {
  return {
    noticeId: data.noticeId,
    title: data.title,
    body: data.body,
    type: 'notice_notification',
  };
};

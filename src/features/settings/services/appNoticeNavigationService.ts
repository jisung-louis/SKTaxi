export interface AppNoticeForegroundNotificationPayload {
  body: string;
  noticeId: string;
  title: string;
  type: 'app_notice';
}

export const buildAppNoticeForegroundNotification = (data: {
  appNoticeId: string;
  title?: string;
}): AppNoticeForegroundNotificationPayload => {
  return {
    body: data.title || '새 앱 공지가 도착했습니다.',
    noticeId: data.appNoticeId,
    title: '새 앱 공지',
    type: 'app_notice',
  };
};

export const navigateToAppNoticeDetail = (navigation: any, noticeId: string) => {
  try {
    navigation.navigate('Main', {
      screen: '홈',
      params: { screen: 'AppNoticeDetail', params: { noticeId } },
    });
    return;
  } catch {}

  try {
    navigation.navigate('홈', {
      screen: 'AppNoticeDetail',
      params: { noticeId },
    });
  } catch {}
};

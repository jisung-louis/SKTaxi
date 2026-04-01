export {
  navigateToAppNoticeDetail,
} from '@/app/navigation/services/appRouteNavigation';

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

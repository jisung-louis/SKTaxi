import type {NotificationSettingKey} from '../model/notificationSettingsSource';

export type NotificationSettingIconKey =
  | 'allNotifications'
  | 'partyNotifications'
  | 'noticeNotifications'
  | 'boardLikeNotifications'
  | 'boardCommentNotifications'
  | 'systemNotifications'
  | 'marketingNotifications';

export interface NotificationSettingMeta {
  iconKey: NotificationSettingIconKey;
  subtitle: string;
  title: string;
}

export const NOTIFICATION_SETTINGS_MASTER_META: NotificationSettingMeta = {
  iconKey: 'allNotifications',
  subtitle: '모든 알림을 한 번에 켜거나 끕니다',
  title: '모든 알림',
};

export const NOTIFICATION_SETTINGS_ITEM_META: Record<
  NotificationSettingKey,
  NotificationSettingMeta
> = {
  partyNotifications: {
    iconKey: 'partyNotifications',
    subtitle: '새 파티 생성, 파티 동승 요청, 파티 상태 변경 알림',
    title: '택시파티 알림',
  },
  noticeNotifications: {
    iconKey: 'noticeNotifications',
    subtitle: '학교 공지사항 실시간 알림',
    title: '학교 공지사항 알림',
  },
  boardLikeNotifications: {
    iconKey: 'boardLikeNotifications',
    subtitle: '내 게시물에 좋아요 눌렸을 때 알림',
    title: '게시물 좋아요 알림',
  },
  boardCommentNotifications: {
    iconKey: 'boardCommentNotifications',
    subtitle: '내 게시물이나 내 댓글에 댓글/답글이 달렸을 때 알림',
    title: '댓글/답글 알림',
  },
  systemNotifications: {
    iconKey: 'systemNotifications',
    subtitle: '앱 업데이트, 서비스 점검, 보안 관련 알림',
    title: '시스템 알림',
  },
  marketingNotifications: {
    iconKey: 'marketingNotifications',
    subtitle: '이벤트, 프로모션, 추천 서비스 알림',
    title: '마케팅 알림',
  },
};

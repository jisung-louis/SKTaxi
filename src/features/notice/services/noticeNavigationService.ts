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

const bbsToSubviewMap: Record<string, string> = {
  '97': '342',
  '96': '343',
  '116': '901',
  '95': '344',
  '94': '345',
  '93': '346',
  '90': '347',
  '89': '348',
  '87': '349',
  '86': '350',
  '84': '351',
  '83': '352',
  '82': '353',
  '80': '354',
};

export const toNoticeSubviewUrl = (link: string) => {
  const match = link.match(/bbs\/skukr\/(\d+)\/(\d+)\/artclView\.do/);
  if (!match) {
    return link;
  }

  const [, bbsId, articleId] = match;
  const subviewId = bbsToSubviewMap[bbsId];
  if (!subviewId) {
    return link;
  }

  const rawPath = `/bbs/skukr/${bbsId}/${articleId}/artclView.do?isViewMine=false&bbsClSeq=&srchWrd=&page=1&password=`;
  const encodedPath = encodeURIComponent(rawPath);
  const fullEncoded = btoa(`fnct1|@@|${encodedPath}`);

  return `https://www.sungkyul.ac.kr/skukr/${subviewId}/subview.do?enc=${fullEncoded}`;
};

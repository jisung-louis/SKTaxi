import type { NoticeForegroundNotificationPayload } from '../model/types';

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const encodeBase64Ascii = (value: string): string => {
  let output = '';

  for (let index = 0; index < value.length; index += 3) {
    const byte1 = value.charCodeAt(index);
    const byte2 = value.charCodeAt(index + 1);
    const byte3 = value.charCodeAt(index + 2);
    const hasByte2 = !Number.isNaN(byte2);
    const hasByte3 = !Number.isNaN(byte3);

    const chunk = (byte1 * 65536) + ((hasByte2 ? byte2 : 0) * 256) + (hasByte3 ? byte3 : 0);

    output += BASE64_ALPHABET[Math.floor(chunk / 262144) % 64];
    output += BASE64_ALPHABET[Math.floor(chunk / 4096) % 64];
    output += !hasByte2
      ? '='
      : BASE64_ALPHABET[Math.floor(chunk / 64) % 64];
    output += !hasByte3
      ? '='
      : BASE64_ALPHABET[chunk % 64];
  }

  return output;
};

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

/**
 * 공지사항 목록 조회 페이지 URL에서 공지사항 상세 웹뷰 URL로 변환하기 위한 매핑 정보
 */
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

/**
 * 공지사항 목록 조회 페이지 URL에서 공지사항 상세 웹뷰 URL로 변환
 * @param link 공지사항 상세 웹뷰 URL
 * @returns 공지사항 상세 웹뷰 URL
 */
export const toNoticeDetailWebViewUrl = (link: string) => {
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
  // encodeURIComponent output is ASCII-only, so a local ASCII base64 encoder
  // avoids relying on browser-only globals like btoa in React Native.
  const fullEncoded = encodeBase64Ascii(`fnct1|@@|${encodedPath}`);

  return `https://www.sungkyul.ac.kr/skukr/${subviewId}/subview.do?enc=${fullEncoded}`;
};

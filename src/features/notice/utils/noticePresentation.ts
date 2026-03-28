import {format} from 'date-fns';

import type {NoticeHomeTone} from '../model/noticeHomeViewData';

const CATEGORY_DISPLAY_LABEL_MAP: Record<string, string> = {
  '공모/행사': '행사',
  '장학/등록/학자금': '장학',
  '취업/진로개발/창업': '취업',
  생활관: '시설',
  시설: '시설',
  일반: '시설',
  입찰구매정보: '시설',
  학사: '학사',
};

const CATEGORY_TONE_MAP: Record<string, NoticeHomeTone> = {
  시설: 'gray',
  장학: 'purple',
  취업: 'orange',
  행사: 'pink',
  학사: 'blue',
};

export const getNoticeCategoryDisplayLabel = (category: string) =>
  CATEGORY_DISPLAY_LABEL_MAP[category] ?? category.split('/')[0] ?? category;

export const getNoticeCategoryTone = (label: string): NoticeHomeTone =>
  CATEGORY_TONE_MAP[label] ?? 'gray';

export const formatNoticeSearchDate = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'yyyy-MM-dd');
};

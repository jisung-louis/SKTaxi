import {format} from 'date-fns';

import type {ContentDetailBadgeTone} from '@/shared/types/contentDetailViewData';

import type {NoticeCategory} from '../model/constants';

const CATEGORY_TONE_MAP: Record<
  Exclude<NoticeCategory, '전체'>,
  ContentDetailBadgeTone
> = {
  새소식: 'green',
  학사: 'blue',
  학생: 'purple',
  '장학/등록/학자금': 'purple',
  입학: 'pink',
  '취업/진로개발/창업': 'orange',
  '공모/행사': 'pink',
  '교육/글로벌': 'blue',
  일반: 'gray',
  입찰구매정보: 'gray',
  사회봉사센터: 'green',
  장애학생지원센터: 'purple',
  생활관: 'gray',
  비교과: 'orange',
};

export const getNoticeCategoryDisplayLabel = (category: string) => category;

export const getNoticeCategoryTone = (
  category: string,
): ContentDetailBadgeTone =>
  CATEGORY_TONE_MAP[category as Exclude<NoticeCategory, '전체'>] ?? 'gray';

export const formatNoticeSearchDate = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'yyyy-MM-dd');
};

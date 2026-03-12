export const NOTICE_CATEGORIES = [
  '전체',
  '새소식',
  '학사',
  '학생',
  '장학/등록/학자금',
  '입학',
  '취업/진로개발/창업',
  '공모/행사',
  '교육/글로벌',
  '일반',
  '입찰구매정보',
  '사회봉사센터',
  '장애학생지원센터',
  '생활관',
  '비교과',
] as const;

export type NoticeCategory = typeof NOTICE_CATEGORIES[number];

const NOTICE_CATEGORY_SETTING_KEY_MAP: Record<string, string> = {
  새소식: 'news',
  학사: 'academy',
  학생: 'student',
  '장학/등록/학자금': 'scholarship',
  입학: 'admission',
  '취업/진로개발/창업': 'career',
  '공모/행사': 'event',
  '교육/글로벌': 'education',
  일반: 'general',
  입찰구매정보: 'procurement',
  사회봉사센터: 'volunteer',
  장애학생지원센터: 'accessibility',
  생활관: 'dormitory',
  비교과: 'extracurricular',
};

export const getCategorySettingKey = (category: string) => {
  return NOTICE_CATEGORY_SETTING_KEY_MAP[category] || 'general';
};

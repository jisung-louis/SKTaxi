// SKTaxi: 카테고리 상수 - 공지사항 화면에서 사용
// SRP: 상수 데이터 관리

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

/**
 * 카테고리 이름을 설정 키로 변환
 */
export function getCategorySettingKey(category: string): string {
    const keyMap: Record<string, string> = {
        '새소식': 'news',
        '학사': 'academy',
        '학생': 'student',
        '장학/등록/학자금': 'scholarship',
        '입학': 'admission',
        '취업/진로개발/창업': 'career',
        '공모/행사': 'event',
        '교육/글로벌': 'education',
        '일반': 'general',
        '입찰구매정보': 'procurement',
        '사회봉사센터': 'volunteer',
        '장애학생지원센터': 'accessibility',
        '생활관': 'dormitory',
        '비교과': 'extracurricular',
    };
    return keyMap[category] || 'general';
}

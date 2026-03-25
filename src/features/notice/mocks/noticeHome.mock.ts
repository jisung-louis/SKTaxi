import type {
  NoticeHomeSettings,
  NoticeHomeSourceItem,
} from '../model/noticeHomeData';

export const NOTICE_HOME_ITEMS_MOCK: NoticeHomeSourceItem[] = [
  {
    category: '학사',
    id: 'notice-home-1',
    isRead: false,
    postedAt: '2026-03-15T09:00:00+09:00',
    title: '2024학년도 1학기 중간고사 일정 안내',
  },
  {
    category: '장학/등록/학자금',
    id: 'notice-home-2',
    isRead: false,
    postedAt: '2026-03-14T14:00:00+09:00',
    title: '2024년 1학기 국가장학금 신청 안내',
  },
  {
    category: '취업/진로개발/창업',
    id: 'notice-home-3',
    isRead: true,
    postedAt: '2026-03-13T11:00:00+09:00',
    title: '2024 상반기 채용박람회 개최 안내',
  },
  {
    category: '학사',
    id: 'notice-home-4',
    isRead: true,
    postedAt: '2026-03-12T10:30:00+09:00',
    title: '수강신청 변경 기간 안내',
  },
  {
    category: '공모/행사',
    id: 'notice-home-5',
    isRead: true,
    postedAt: '2026-03-11T08:40:00+09:00',
    title: '2024 봄 축제 개최 안내',
  },
  {
    category: '학사',
    id: 'notice-home-6',
    isRead: true,
    postedAt: '2026-03-10T16:20:00+09:00',
    title: '휴학 신청 기간 안내',
  },
  {
    category: '일반',
    id: 'notice-home-7',
    isRead: true,
    postedAt: '2026-03-09T13:15:00+09:00',
    title: '도서관 시설 보수 공사 안내',
  },
  {
    category: '학사',
    id: 'notice-home-8',
    isRead: true,
    postedAt: '2026-03-08T09:10:00+09:00',
    title: '복수전공 신청 안내',
  },
  {
    category: '생활관',
    id: 'notice-home-9',
    isRead: true,
    postedAt: '2026-03-07T17:45:00+09:00',
    title: '생활관 정기 점검 일정 안내',
  },
  {
    category: '입찰구매정보',
    id: 'notice-home-10',
    isRead: true,
    postedAt: '2026-03-06T15:00:00+09:00',
    title: '캠퍼스 시설 장비 구매 입찰 공고',
  },
];

export const NOTICE_HOME_SETTINGS_MOCK: NoticeHomeSettings = {
  noticeNotifications: true,
  noticeNotificationsDetail: {
    academy: true,
    career: true,
    dormitory: true,
    event: true,
    general: true,
    procurement: false,
    scholarship: true,
  },
};

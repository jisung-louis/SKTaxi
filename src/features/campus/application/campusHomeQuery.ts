import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {INoticeRepository} from '@/features/notice/data/repositories/INoticeRepository';
import {toNoticeTimestampMillis} from '@/features/notice/model/selectors';
import type {Notice} from '@/features/notice/model/types';
import {timetableApiClient} from '@/features/timetable/data/api/timetableApiClient';
import {
  generatePeriods,
  getCurrentSemester,
  getPeriodTimeInfo,
} from '@/features/timetable/services/timetableUtils';
import {normalizeDate, normalizeDateObject} from '@/shared/lib/date';

import {getAcademicCalendarEventColorTone} from '../model/academicCalendarEventTones';
import type {IAcademicRepository} from '../data/repositories/IAcademicRepository';
import type {ICampusBannerRepository} from '../data/repositories/ICampusBannerRepository';
import type {ICafeteriaRepository} from '../data/repositories/ICafeteriaRepository';
import {
  type CampusAcademicEventBadgeViewData,
  type CampusAcademicEventViewData,
  type CampusHighlightTone,
  type CampusHomeViewData,
  type CampusNoticeItemViewData,
  type CampusNoticeTone,
  type CampusTimetableEmptyStateViewData,
  type CampusTimetablePeriodViewData,
  type CampusTimetableSessionViewData,
} from '../model/campusHome';
import {formatLocalDateKey} from '../model/cafeteria';
import {
  getDefaultCampusHomeBannerViewData,
  loadCampusHomeBannerViewData,
} from './campusHomeBannerQuery';
import {buildCampusRecommendedMenus} from './cafeteriaMenuAssembler';

const IMPORTANT_NOTICE_FETCH_LIMIT = 100;
const NOTICE_PREVIEW_LIMIT = 3;
const IMPORTANT_NOTICE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const TIMETABLE_COLLAPSED_VISIBLE_COUNT = 9;
const TIMETABLE_SESSION_TONES: Array<
  Extract<CampusHighlightTone, 'blue' | 'orange'>
> = ['orange', 'blue'];

const NOTICE_CATEGORY_LABEL_MAP: Record<string, string> = {
  '공모/행사': '행사',
  '장학/등록/학자금': '장학',
  '취업/진로개발/창업': '취업',
  생활관: '시설',
  시설: '시설',
  일반: '시설',
  입찰구매정보: '시설',
  학사: '학사',
};

const NOTICE_TONE_MAP: Record<string, CampusNoticeTone> = {
  시설: 'brand',
  장학: 'purple',
  취업: 'orange',
  행사: 'brand',
  학사: 'blue',
};

const getNoticeCategoryLabel = (category: string) =>
  NOTICE_CATEGORY_LABEL_MAP[category] ?? category.split('/')[0] ?? category;

const getNoticeTone = (label: string): CampusNoticeTone =>
  NOTICE_TONE_MAP[label] ?? 'brand';

const formatNoticeDateLabel = (postedAt: unknown) => {
  const millis = toNoticeTimestampMillis(postedAt);

  if (!millis) {
    return '';
  }

  return format(new Date(millis), 'yyyy-MM-dd');
};

const mapNoticeToPreviewItem = (notice: Notice): CampusNoticeItemViewData => {
  const categoryLabel = getNoticeCategoryLabel(notice.category);

  return {
    categoryLabel,
    commentCount: notice.commentCount ?? 0,
    id: notice.id,
    likeCount: notice.likeCount ?? 0,
    publishedAtLabel: formatNoticeDateLabel(notice.postedAt),
    title: notice.title,
    tone: getNoticeTone(categoryLabel),
    viewCount: notice.viewCount ?? 0,
  };
};

const createTimetablePeriods = (): CampusTimetablePeriodViewData[] =>
  generatePeriods().map(periodNumber => {
    const timeInfo = getPeriodTimeInfo(periodNumber);

    return {
      endTimeLabel: timeInfo.endTime,
      id: `period-${periodNumber}`,
      periodLabel: `${periodNumber}교시`,
      periodNumber,
      startTimeLabel: timeInfo.startTime,
    };
  });

const createTimetableEmptyState = (
  emptyState?: Partial<CampusTimetableEmptyStateViewData>,
): CampusTimetableEmptyStateViewData => ({
  description:
    emptyState?.description ?? '등록된 시간표 기준으로 오늘 수업이 없습니다.',
  title: emptyState?.title ?? '오늘은 수업이 없어요',
});

const createSundayTimetableEmptyState = (): CampusTimetableEmptyStateViewData =>
  createTimetableEmptyState({
    description: '일요일엔 휴식을 취하세요.',
    title: '오늘은 일요일이에요',
  });

const getMinutesFromTimeLabel = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
};

const getCurrentPeriodNumber = (currentDate: Date) => {
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  for (const periodNumber of generatePeriods()) {
    const {startTime, endTime} = getPeriodTimeInfo(periodNumber);
    const startMinutes = getMinutesFromTimeLabel(startTime);
    const endMinutes = getMinutesFromTimeLabel(endTime);

    if (startMinutes == null || endMinutes == null) {
      continue;
    }

    if (startMinutes <= currentMinutes && currentMinutes <= endMinutes) {
      return periodNumber;
    }
  }

  return null;
};

const getTimetableStatus = (
  schedule: {
    startPeriod: number;
    endPeriod: number;
  },
  currentPeriodNumber: number | null,
) => {
  if (
    currentPeriodNumber == null ||
    currentPeriodNumber < schedule.startPeriod ||
    currentPeriodNumber > schedule.endPeriod
  ) {
    return undefined;
  }

  return {
    label: '진행중',
    tone: 'blue' as const,
  };
};

const mapCourseToSession = ({
  currentPeriodNumber,
  index,
  schedule,
  title,
  professor,
  location,
  courseId,
}: {
  courseId: string;
  currentPeriodNumber: number | null;
  index: number;
  location?: string | null;
  professor?: string | null;
  schedule: {
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
  };
  title: string;
}): CampusTimetableSessionViewData => {
  const status = getTimetableStatus(schedule, currentPeriodNumber);

  return {
    endPeriod: schedule.endPeriod,
    id: `${courseId}-${schedule.dayOfWeek}-${schedule.startPeriod}`,
    instructorLabel: professor ? `${professor} 교수님` : undefined,
    isCurrent: Boolean(status),
    roomLabel: location ?? undefined,
    startPeriod: schedule.startPeriod,
    status,
    title,
    tone: TIMETABLE_SESSION_TONES[index % TIMETABLE_SESSION_TONES.length],
  };
};

const formatTimetableDateLabel = (currentDate: Date) =>
  format(currentDate, 'M월 d일 EEEE', {locale: ko});

const isImportantNoticeCandidate = (notice: Notice) => {
  const millis = toNoticeTimestampMillis(notice.postedAt);

  return (
    millis != null &&
    Date.now() - millis <= IMPORTANT_NOTICE_WINDOW_MS &&
    Date.now() >= millis
  );
};

const getImportantNoticeComparator = (randomRankById: Map<string, number>) => {
  return (left: Notice, right: Notice) =>
    (right.viewCount ?? 0) - (left.viewCount ?? 0) ||
    (right.likeCount ?? 0) - (left.likeCount ?? 0) ||
    (right.commentCount ?? 0) - (left.commentCount ?? 0) ||
    (randomRankById.get(left.id) ?? 0) - (randomRankById.get(right.id) ?? 0);
};

const loadImportantNoticePreviewItems = async ({
  noticeRepository,
}: {
  noticeRepository: INoticeRepository;
}): Promise<CampusNoticeItemViewData[]> => {
  const notices = await noticeRepository.getRecentNotices(
    IMPORTANT_NOTICE_FETCH_LIMIT,
  );
  const candidates = notices.filter(isImportantNoticeCandidate);
  const randomRankById = new Map(
    candidates.map(notice => [notice.id, Math.random()]),
  );

  return candidates
    .sort(getImportantNoticeComparator(randomRankById))
    .slice(0, NOTICE_PREVIEW_LIMIT)
    .map(mapNoticeToPreviewItem);
};

const loadTimetablePreview = async ({
  currentUserId,
  currentDate,
}: {
  currentDate: Date;
  currentUserId?: string;
}): Promise<CampusHomeViewData['timetable']> => {
  const periods = createTimetablePeriods();

  if (!currentUserId) {
    return {
      collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
      dateLabel: formatTimetableDateLabel(currentDate),
      emptyState: createTimetableEmptyState({
        description: '로그인 정보가 준비되면 시간표를 함께 보여줍니다.',
        title: '시간표 정보를 준비 중이에요',
      }),
      periods,
      sessions: [],
    };
  }

  const semester = getCurrentSemester();
  const response = await timetableApiClient.getMyTimetable(semester);
  const timetable = response.data;

  if (timetable.courses.length === 0) {
    return {
      collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
      dateLabel: formatTimetableDateLabel(currentDate),
      emptyState: createTimetableEmptyState(),
      periods,
      sessions: [],
    };
  }

  const currentDayOfWeek = currentDate.getDay();
  const currentPeriodNumber = getCurrentPeriodNumber(currentDate);
  const sessions = timetable.slots
    .filter(slot => slot.dayOfWeek === currentDayOfWeek)
    .sort(
      (left, right) =>
        left.startPeriod - right.startPeriod ||
        left.courseName.localeCompare(right.courseName, 'ko-KR'),
    )
    .map((slot, index) =>
      mapCourseToSession({
        courseId: slot.courseId,
        currentPeriodNumber,
        index,
        location: slot.location,
        professor: slot.professor,
        schedule: {
          dayOfWeek: slot.dayOfWeek,
          startPeriod: slot.startPeriod,
          endPeriod: slot.endPeriod,
        },
        title: slot.courseName,
      }),
    );

  return {
    collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
    dateLabel: formatTimetableDateLabel(currentDate),
    emptyState:
      sessions.length > 0
        ? undefined
        : currentDayOfWeek === 0
          ? createSundayTimetableEmptyState()
          : createTimetableEmptyState({
              description: '등록된 시간표 기준으로 오늘 일정이 없습니다.',
            }),
    periods,
    sessions,
  };
};

const buildAcademicBadge = (
  isImportant?: boolean,
): CampusAcademicEventBadgeViewData | undefined =>
  isImportant
    ? {
        label: '중요',
        tone: 'pink',
      }
    : undefined;

const formatAcademicDateRangeLabel = (startDate: string, endDate: string) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const startLabel = format(start, 'yyyy-MM-dd');
  const endLabel = format(end, 'yyyy-MM-dd');

  return startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`;
};

const mapScheduleToAcademicPreviewItem = (
  schedule: Awaited<ReturnType<IAcademicRepository['getSchedules']>>[number],
  index: number,
): CampusAcademicEventViewData => {
  const startDate = normalizeDate(schedule.startDate);
  const colorTone = getAcademicCalendarEventColorTone(index);

  return {
    badge: buildAcademicBadge(schedule.isPrimary),
    dateBoxBackgroundColor: colorTone.accentColor,
    dateBoxTextColor: colorTone.barTextColor,
    dateRangeLabel: formatAcademicDateRangeLabel(
      schedule.startDate,
      schedule.endDate,
    ),
    dayLabel: `${startDate.getDate()}`,
    id: schedule.id,
    monthLabel: `${startDate.getMonth() + 1}월`,
    title: schedule.title,
  };
};

const loadAcademicPreviewItems = async ({
  academicRepository,
  currentDate,
}: {
  academicRepository: IAcademicRepository;
  currentDate: Date;
}) => {
  const today = normalizeDateObject(currentDate);
  const schedules = await academicRepository.getSchedules();

  return schedules
    .filter(
      schedule => normalizeDate(schedule.endDate).getTime() >= today.getTime(),
    )
    .sort(
      (left, right) =>
        normalizeDate(left.startDate).getTime() -
        normalizeDate(right.startDate).getTime(),
    )
    .slice(0, 3)
    .map(mapScheduleToAcademicPreviewItem);
};

export const loadCampusHomeQueryResult = async ({
  academicRepository,
  campusBannerRepository,
  cafeteriaRepository,
  noticeRepository,
  currentUserId,
}: {
  academicRepository: IAcademicRepository;
  campusBannerRepository: ICampusBannerRepository;
  cafeteriaRepository: ICafeteriaRepository;
  currentUserId?: string;
  noticeRepository: INoticeRepository;
}): Promise<CampusHomeViewData> => {
  const currentDate = new Date();
  const currentDateKey = formatLocalDateKey(currentDate);
  const [
    bannerResult,
    noticesResult,
    timetableResult,
    cafeteriaResult,
    academicResult,
  ] = await Promise.allSettled([
    loadCampusHomeBannerViewData({
      campusBannerRepository,
    }),
    loadImportantNoticePreviewItems({
      noticeRepository,
    }),
    loadTimetablePreview({
      currentDate,
      currentUserId,
    }),
    cafeteriaRepository.getCurrentWeekMenu().then(menu =>
      menu
        ? buildCampusRecommendedMenus({
            currentDate: currentDateKey,
            menu,
          })
        : [],
    ),
    loadAcademicPreviewItems({
      academicRepository,
      currentDate,
    }),
  ]);

  if (bannerResult.status === 'rejected') {
    console.warn(
      'Campus 배너 프리뷰를 불러오지 못했습니다.',
      bannerResult.reason,
    );
  }

  if (noticesResult.status === 'rejected') {
    console.warn(
      'Campus 공지 프리뷰를 불러오지 못했습니다.',
      noticesResult.reason,
    );
  }

  if (timetableResult.status === 'rejected') {
    console.warn(
      'Campus 시간표 프리뷰를 불러오지 못했습니다.',
      timetableResult.reason,
    );
  }

  if (cafeteriaResult.status === 'rejected') {
    console.warn(
      'Campus 학식 프리뷰를 불러오지 못했습니다.',
      cafeteriaResult.reason,
    );
  }

  if (academicResult.status === 'rejected') {
    console.warn(
      'Campus 학사일정 프리뷰를 불러오지 못했습니다.',
      academicResult.reason,
    );
  }

  return {
    academicCalendar: {
      items: academicResult.status === 'fulfilled' ? academicResult.value : [],
    },
    banners:
      bannerResult.status === 'fulfilled'
        ? bannerResult.value
        : getDefaultCampusHomeBannerViewData(),
    cafeteria: {
      recommendedMenus:
        cafeteriaResult.status === 'fulfilled' ? cafeteriaResult.value : [],
    },
    notices: {
      items: noticesResult.status === 'fulfilled' ? noticesResult.value : [],
    },
    timetable:
      timetableResult.status === 'fulfilled'
        ? timetableResult.value
        : {
            collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
            dateLabel: formatTimetableDateLabel(currentDate),
            emptyState: createTimetableEmptyState({
              description: '잠시 후 다시 확인해주세요.',
              title: '오늘 시간표를 불러오지 못했어요',
            }),
            periods: createTimetablePeriods(),
            sessions: [],
          },
  };
};

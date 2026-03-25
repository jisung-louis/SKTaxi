import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {INoticeRepository} from '@/features/notice/data/repositories/INoticeRepository';
import {
  isNoticeRead,
  toNoticeTimestampMillis,
} from '@/features/notice/model/selectors';
import type {Notice, ReadStatusMap} from '@/features/notice/model/types';
import {resolveNoticeReadStatus} from '@/features/notice/services/noticeReadStateService';
import type {ICourseRepository} from '@/features/timetable/data/repositories/ICourseRepository';
import type {
  ITimetableRepository,
  Timetable,
} from '@/features/timetable/data/repositories/ITimetableRepository';
import type {Course} from '@/features/timetable/model/types';
import {
  generatePeriods,
  getCurrentSemester,
  getPeriodTimeInfo,
} from '@/features/timetable/services/timetableUtils';
import type {IUserRepository} from '@/features/user/data/repositories/IUserRepository';
import {normalizeDate, normalizeDateObject} from '@/shared/lib/date';

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
import {toAcademicCalendarEventSource} from './academicCalendarEventMapper';
import {
  getDefaultCampusHomeBannerViewData,
  loadCampusHomeBannerViewData,
} from './campusHomeBannerQuery';
import {buildCampusRecommendedMenus} from './cafeteriaMenuAssembler';

const NOTICE_PREVIEW_LIMIT = 3;
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
    id: notice.id,
    publishedAtLabel: formatNoticeDateLabel(notice.postedAt),
    title: notice.title,
    tone: getNoticeTone(categoryLabel),
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
  schedule: Course['schedule'][number],
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
  course,
  currentPeriodNumber,
  index,
  schedule,
}: {
  course: Course;
  currentPeriodNumber: number | null;
  index: number;
  schedule: Course['schedule'][number];
}): CampusTimetableSessionViewData => {
  const status = getTimetableStatus(schedule, currentPeriodNumber);

  return {
    endPeriod: schedule.endPeriod,
    id: `${course.id}-${schedule.dayOfWeek}-${schedule.startPeriod}`,
    instructorLabel: `${course.professor} 교수님`,
    isCurrent: Boolean(status),
    roomLabel: course.location,
    startPeriod: schedule.startPeriod,
    status,
    title: course.name,
    tone: TIMETABLE_SESSION_TONES[index % TIMETABLE_SESSION_TONES.length],
  };
};

const loadTimetableSnapshot = (
  timetableRepository: ITimetableRepository,
  userId: string,
  semester: string,
) =>
  new Promise<Timetable | null>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;
    let shouldCleanupImmediately = false;
    let settled = false;

    const finish =
      <T>(handler: (value: T) => void) =>
      (value: T) => {
        if (settled) {
          return;
        }

        settled = true;

        if (unsubscribe) {
          unsubscribe();
        } else {
          shouldCleanupImmediately = true;
        }

        handler(value);
      };

    unsubscribe = timetableRepository.subscribeToTimetable(userId, semester, {
      onData: finish(resolve),
      onError: finish(reject),
    });

    if (shouldCleanupImmediately) {
      unsubscribe();
    }
  });

const formatTimetableDateLabel = (currentDate: Date) =>
  format(currentDate, 'M월 d일 EEEE', {locale: ko});

const loadNoticePreviewItems = async ({
  noticeRepository,
  userRepository,
  currentUserId,
}: {
  currentUserId?: string;
  noticeRepository: INoticeRepository;
  userRepository: IUserRepository;
}): Promise<CampusNoticeItemViewData[]> => {
  const notices = await noticeRepository.getRecentNotices(
    NOTICE_PREVIEW_LIMIT * 3,
  );

  let readStatus: ReadStatusMap = {};
  let userJoinedAt: unknown = null;

  if (currentUserId) {
    if (currentUserId !== 'current-user') {
      try {
        const profile = await userRepository.getUserProfile(currentUserId);
        userJoinedAt = profile?.joinedAt ?? null;
      } catch (error) {
        console.warn('Campus 공지 사용자 정보를 불러오지 못했습니다.', error);
      }
    }

    try {
      readStatus = await resolveNoticeReadStatus({
        notices,
        noticeRepository,
        userId: currentUserId,
        userJoinedAt,
      });
    } catch (error) {
      console.warn('Campus 공지 읽음 상태를 불러오지 못했습니다.', error);
    }
  }

  const unreadNotices = notices.filter(
    notice => !isNoticeRead(notice, readStatus, userJoinedAt),
  );
  const source = unreadNotices.length > 0 ? unreadNotices : notices;

  return source.slice(0, NOTICE_PREVIEW_LIMIT).map(mapNoticeToPreviewItem);
};

const loadTimetablePreview = async ({
  courseRepository,
  timetableRepository,
  currentUserId,
  currentDate,
}: {
  courseRepository: ICourseRepository;
  currentDate: Date;
  currentUserId?: string;
  timetableRepository: ITimetableRepository;
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
  const [timetable, semesterCourses] = await Promise.all([
    loadTimetableSnapshot(timetableRepository, currentUserId, semester),
    courseRepository.getCoursesBySemester(semester),
  ]);

  if (!timetable || timetable.courses.length === 0) {
    return {
      collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
      dateLabel: formatTimetableDateLabel(currentDate),
      emptyState: createTimetableEmptyState(),
      periods,
      sessions: [],
    };
  }

  const currentDayOfWeek = currentDate.getDay();
  const courseById = new Map(
    semesterCourses.map(course => [course.id, course]),
  );
  const selectedCourses = timetable.courses
    .map(courseId => courseById.get(courseId))
    .filter((course): course is Course => Boolean(course));
  const currentPeriodNumber = getCurrentPeriodNumber(currentDate);
  const sessions = selectedCourses
    .flatMap(course =>
      course.schedule.map(schedule => ({
        course,
        schedule,
      })),
    )
    .filter(({schedule}) => schedule.dayOfWeek === currentDayOfWeek)
    .sort(
      (left, right) =>
        left.schedule.startPeriod - right.schedule.startPeriod ||
        left.course.name.localeCompare(right.course.name, 'ko-KR'),
    )
    .map(({course, schedule}, index) =>
      mapCourseToSession({
        course,
        currentPeriodNumber,
        index,
        schedule,
      }),
    );

  return {
    collapsedVisibleCount: TIMETABLE_COLLAPSED_VISIBLE_COUNT,
    dateLabel: formatTimetableDateLabel(currentDate),
    emptyState:
      sessions.length > 0
        ? undefined
        : createTimetableEmptyState({
            description: '등록된 시간표 기준으로 오늘 일정이 없습니다.',
          }),
    periods,
    sessions,
  };
};

const buildAcademicBadge = ({
  isImportant,
  kind,
}: {
  isImportant?: boolean;
  kind: ReturnType<typeof toAcademicCalendarEventSource>['kind'];
}): CampusAcademicEventBadgeViewData | undefined => {
  if (isImportant) {
    return {
      label: '중요',
      placement: 'inline',
      tone: 'pink',
    };
  }

  switch (kind) {
    case 'exam':
      return {
        label: '시험',
        placement: 'trailing',
        tone: 'blue',
      };
    case 'registration':
      return {
        label: '학사',
        placement: 'trailing',
        tone: 'brand',
      };
    case 'holiday':
      return {
        label: '휴일',
        placement: 'trailing',
        tone: 'orange',
      };
    case 'closure':
      return {
        label: '휴강',
        placement: 'trailing',
        tone: 'pink',
      };
    case 'semester':
    default:
      return undefined;
  }
};

const formatAcademicDateRangeLabel = (startDate: string, endDate: string) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const startLabel = format(start, 'yyyy-MM-dd');
  const endLabel = format(end, 'yyyy-MM-dd');

  return startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`;
};

const mapScheduleToAcademicPreviewItem = (
  schedule: Awaited<ReturnType<IAcademicRepository['getSchedules']>>[number],
): CampusAcademicEventViewData => {
  const source = toAcademicCalendarEventSource(schedule);
  const startDate = normalizeDate(schedule.startDate);

  return {
    badge: buildAcademicBadge(source),
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
  courseRepository,
  noticeRepository,
  timetableRepository,
  userRepository,
  currentUserId,
}: {
  academicRepository: IAcademicRepository;
  campusBannerRepository: ICampusBannerRepository;
  cafeteriaRepository: ICafeteriaRepository;
  courseRepository: ICourseRepository;
  currentUserId?: string;
  noticeRepository: INoticeRepository;
  timetableRepository: ITimetableRepository;
  userRepository: IUserRepository;
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
    loadNoticePreviewItems({
      currentUserId,
      noticeRepository,
      userRepository,
    }),
    loadTimetablePreview({
      courseRepository,
      currentDate,
      currentUserId,
      timetableRepository,
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

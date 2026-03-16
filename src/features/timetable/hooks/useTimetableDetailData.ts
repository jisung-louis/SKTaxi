import React from 'react';
import {Alert, Share} from 'react-native';

import {getPeriodTimeInfo} from '../services/timetableUtils';
import type {
  TimetableCatalogCourseRecord,
  TimetableCourseRecord,
  TimetableCourseScheduleRecord,
  TimetableManualCourseDraft,
  TimetableSemesterRecord,
} from '../model/timetableDetailSource';
import {TIMETABLE_COURSE_TONES} from '../model/timetableCourseTones';
import type {
  TimetableAddCourseSheetViewData,
  TimetableCourseDetailViewData,
  TimetableCourseToneId,
  TimetableDetailScreenViewData,
  TimetableDetailViewMode,
  TimetableDayColumnViewData,
  TimetablePeriodViewData,
  TimetableTodayRowViewData,
  TimetableWeekdayId,
} from '../model/timetableDetailViewData';
import {timetableDetailRepository} from '../data/repositories/timetableDetailRepository';

const PERIOD_NUMBERS = Array.from({length: 15}, (_, index) => index + 1);
const DAY_ORDER: TimetableWeekdayId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const DAY_LABELS: Record<TimetableWeekdayId, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
};

const DEFAULT_MANUAL_DRAFT: TimetableManualCourseDraft = {
  credits: 3,
  day: 'mon',
  endPeriod: 3,
  isOnline: false,
  locationLabel: '',
  name: '',
  professor: '',
  startPeriod: 1,
  toneId: 'green',
};

const createPeriodViewData = (): TimetablePeriodViewData[] =>
  PERIOD_NUMBERS.map(periodNumber => {
    const {startTime, endTime} = getPeriodTimeInfo(periodNumber);

    return {
      id: `period-${periodNumber}`,
      periodLabel: `${periodNumber}교시`,
      periodNumber,
      startTimeLabel: startTime,
      endTimeLabel: endTime,
    };
  });

const PERIOD_VIEW_DATA = createPeriodViewData();

const isScheduleOverlapping = (
  left: TimetableCourseScheduleRecord,
  right: TimetableCourseScheduleRecord,
) =>
  left.day === right.day &&
  left.startPeriod <= right.endPeriod &&
  right.startPeriod <= left.endPeriod;

const findConflictCourseIds = (
  course: Pick<TimetableCourseRecord, 'id' | 'schedules'>,
  currentCourses: TimetableCourseRecord[],
) => {
  if (course.schedules.length === 0) {
    return [];
  }

  return currentCourses
    .filter(existingCourse => existingCourse.id !== course.id)
    .filter(existingCourse =>
      existingCourse.schedules.some(existingSchedule =>
        course.schedules.some(schedule =>
          isScheduleOverlapping(existingSchedule, schedule),
        ),
      ),
    )
    .map(existingCourse => existingCourse.id);
};

const toDayColumns = (
  courses: TimetableCourseRecord[],
): TimetableDayColumnViewData[] => {
  const hasSaturdayCourse = courses.some(course =>
    course.schedules.some(schedule => schedule.day === 'sat'),
  );

  const visibleDays = hasSaturdayCourse ? DAY_ORDER : DAY_ORDER.slice(0, 5);
  return visibleDays.map(day => ({
    id: day,
    label: DAY_LABELS[day],
  }));
};

const formatCourseMetaLabel = (course: TimetableCourseRecord) => {
  if (course.isOnline) {
    return `${course.professor} 교수님`;
  }

  const primarySchedule = course.schedules[0];

  if (!primarySchedule) {
    return `${course.professor} 교수님`;
  }

  const periodLabel =
    primarySchedule.startPeriod === primarySchedule.endPeriod
      ? `${DAY_LABELS[primarySchedule.day]} ${primarySchedule.startPeriod}교시`
      : `${DAY_LABELS[primarySchedule.day]} ${primarySchedule.startPeriod}-${primarySchedule.endPeriod}교시`;

  return `${periodLabel} · ${course.locationLabel ?? '미정'}`;
};

const formatTodayMetaLabel = (course: TimetableCourseRecord) => {
  if (course.isOnline) {
    return `${course.professor} 교수님 · 온라인`;
  }

  return `${course.professor} 교수님 · ${course.locationLabel ?? '미정'}`;
};

const buildSelectedCourseDetail = (
  course?: TimetableCourseRecord,
): TimetableCourseDetailViewData | undefined => {
  if (!course) {
    return undefined;
  }

  const firstSchedule = course.schedules[0];
  const timeLabel = course.isOnline
    ? '온라인 수업'
    : firstSchedule
      ? firstSchedule.startPeriod === firstSchedule.endPeriod
        ? `${DAY_LABELS[firstSchedule.day]} ${firstSchedule.startPeriod}교시`
        : `${DAY_LABELS[firstSchedule.day]} ${firstSchedule.startPeriod}-${firstSchedule.endPeriod}교시`
      : '시간 미정';

  return {
    codeLabel: course.code,
    courseId: course.id,
    deleteLabel: '강의 삭제',
    rows: [
      {
        iconName: 'person-outline',
        id: 'professor',
        label: '담당 교수',
        value: `${course.professor} 교수님`,
      },
      {
        iconName: 'location-outline',
        id: 'location',
        label: '강의실',
        value: course.isOnline ? '온라인' : course.locationLabel ?? '미정',
      },
      {
        iconName: 'time-outline',
        id: 'time',
        label: '수업 시간',
        value: timeLabel,
      },
      {
        iconName: 'ribbon-outline',
        id: 'credits',
        label: '학점',
        value: `${course.credits}학점`,
      },
    ],
    title: course.name,
    toneId: course.toneId,
  };
};

const buildAddCourseSheetViewData = ({
  activeTab,
  catalogCourses,
  courses,
  manualDraft,
  query,
  selectedToneId,
}: {
  activeTab: 'manual' | 'search';
  catalogCourses: TimetableCatalogCourseRecord[];
  courses: TimetableCourseRecord[];
  manualDraft: TimetableManualCourseDraft;
  query: string;
  selectedToneId: TimetableCourseToneId;
}): TimetableAddCourseSheetViewData => {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCatalogCourses = normalizedQuery
    ? catalogCourses.filter(course =>
        [
          course.name,
          course.professor,
          course.code,
          course.locationLabel ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : catalogCourses;

  return {
    activeTab,
    colors: Object.keys(TIMETABLE_COURSE_TONES).map(colorId => ({
      id: colorId as TimetableCourseToneId,
      selected: colorId === selectedToneId,
    })),
    manual: {
      canSubmit:
        manualDraft.name.trim().length > 0 &&
        (manualDraft.isOnline || manualDraft.locationLabel.trim().length > 0),
      credits: [1, 2, 3].map(credit => ({
        id: credit,
        label: `${credit}학점`,
        selected: credit === manualDraft.credits,
      })),
      dayOptions: DAY_ORDER.map(day => ({
        id: day,
        label: DAY_LABELS[day],
        selected: day === manualDraft.day,
      })),
      endPeriod: {
        canDecrease: manualDraft.endPeriod > manualDraft.startPeriod,
        canIncrease: manualDraft.endPeriod < 15,
        label: `${manualDraft.endPeriod}교시`,
      },
      isOnline: manualDraft.isOnline,
      locationValue: manualDraft.locationLabel,
      nameValue: manualDraft.name,
      professorValue: manualDraft.professor,
      selectedColorId: selectedToneId,
      startPeriod: {
        canDecrease: manualDraft.startPeriod > 1,
        canIncrease: manualDraft.startPeriod < manualDraft.endPeriod,
        label: `${manualDraft.startPeriod}교시`,
      },
    },
    search: {
      emptyLabel: filteredCatalogCourses.length === 0 ? '검색 결과가 없습니다.' : undefined,
      items: filteredCatalogCourses.map(course => ({
        alreadyAdded: courses.some(existingCourse => existingCourse.id === course.id),
        codeLabel: course.code,
        courseId: course.id,
        metaLabel: `${course.professor} · ${course.locationLabel ?? '온라인'} · ${course.credits}학점`,
        title: course.name,
      })),
      placeholder: '강의명, 교수명, 강의코드 검색',
      query,
    },
  };
};

const buildScreenViewData = ({
  activeMode,
  activeTab,
  courses,
  currentDay,
  manualDraft,
  query,
  record,
  selectedCourseId,
  selectedToneId,
  showNightClasses,
}: {
  activeMode: TimetableDetailViewMode;
  activeTab: 'manual' | 'search';
  courses: TimetableCourseRecord[];
  currentDay: TimetableWeekdayId;
  manualDraft: TimetableManualCourseDraft;
  query: string;
  record: TimetableSemesterRecord;
  selectedCourseId?: string;
  selectedToneId: TimetableCourseToneId;
  showNightClasses: boolean;
}): TimetableDetailScreenViewData => {
  const periods = PERIOD_VIEW_DATA;
  const allViewPeriods = periods.filter(period => period.periodNumber <= 9);
  const columns = toDayColumns(courses);
  const selectedCourse = courses.find(course => course.id === selectedCourseId);
  const coursesOnCurrentDay = courses
    .filter(course =>
      course.schedules.some(schedule => schedule.day === currentDay),
    )
    .sort((left, right) => {
      const leftStart = left.schedules[0]?.startPeriod ?? Number.MAX_SAFE_INTEGER;
      const rightStart = right.schedules[0]?.startPeriod ?? Number.MAX_SAFE_INTEGER;
      return leftStart - rightStart;
    });
  const hasNightClasses = coursesOnCurrentDay.some(course =>
    course.schedules.some(schedule => schedule.endPeriod > 9),
  );
  const visibleTodayPeriods = showNightClasses ? periods : allViewPeriods;
  const todayRows: TimetableTodayRowViewData[] = [];

  let periodIndex = 0;

  while (periodIndex < visibleTodayPeriods.length) {
    const period = visibleTodayPeriods[periodIndex];
    const session = coursesOnCurrentDay.find(course =>
      course.schedules.some(
        schedule =>
          schedule.day === currentDay &&
          schedule.startPeriod <= period.periodNumber &&
          schedule.endPeriod >= period.periodNumber,
      ),
    );

    if (!session) {
      todayRows.push({
        id: `today-row-${period.periodNumber}`,
        periodLabel: `${period.periodNumber}교시`,
        startTimeLabel: period.startTimeLabel,
        state: 'empty',
      });
      periodIndex += 1;
      continue;
    }

    const schedule = session.schedules.find(
      candidate =>
        candidate.day === currentDay &&
        candidate.startPeriod <= period.periodNumber &&
        candidate.endPeriod >= period.periodNumber,
    );

    if (!schedule || schedule.startPeriod !== period.periodNumber) {
      periodIndex += 1;
      continue;
    }

    const endPeriod = periods.find(
      candidate => candidate.periodNumber === schedule.endPeriod,
    );

    todayRows.push({
      course: {
        courseId: session.id,
        endTimeLabel: endPeriod?.endTimeLabel,
        metaLabel: formatTodayMetaLabel(session),
        title: session.name,
        toneId: session.toneId,
      },
      id: `today-row-${period.periodNumber}`,
      periodLabel: `${period.periodNumber}교시`,
      startTimeLabel: period.startTimeLabel,
      state: 'course',
    });

    periodIndex += schedule.endPeriod - schedule.startPeriod + 1;
  }

  return {
    activeMode,
    addCourseSheet: buildAddCourseSheetViewData({
      activeTab,
      catalogCourses: record.catalogCourses,
      courses,
      manualDraft,
      query,
      selectedToneId,
    }),
    allView: {
      blocks: courses
        .flatMap(course =>
          course.schedules
            .filter(schedule => schedule.startPeriod <= 9)
            .map(schedule => ({
              courseId: course.id,
              endPeriod: Math.min(schedule.endPeriod, 9),
              id: `${course.id}-${schedule.day}-${schedule.startPeriod}`,
              roomLabel: course.isOnline ? '온라인' : course.locationLabel,
              selected: course.id === selectedCourseId,
              startPeriod: schedule.startPeriod,
              title: course.name,
              toneId: course.toneId,
              weekdayId: schedule.day,
            })),
        )
        .filter(block =>
          columns.some(column => column.id === block.weekdayId),
        ),
      columns,
      onlineItems: courses
        .filter(course => course.isOnline)
        .map(course => ({
          courseId: course.id,
          id: `online-${course.id}`,
          metaLabel: `${course.professor} 교수님`,
          title: course.name,
          toneId: course.toneId,
        })),
      periods: allViewPeriods,
      saturdayItems: courses
        .filter(course =>
          course.schedules.some(schedule => schedule.day === 'sat'),
        )
        .map(course => ({
          courseId: course.id,
          id: `sat-${course.id}`,
          metaLabel: formatCourseMetaLabel(course),
          title: course.name,
          toneId: course.toneId,
        })),
    },
    selectedCourse: buildSelectedCourseDetail(selectedCourse),
    semesterLabel: record.label,
    semesterOptions: [],
    totalCreditsLabel: `총 ${courses.reduce((sum, course) => sum + course.credits, 0)}학점`,
    todayView: {
      collapsed: !showNightClasses,
      hasNightClasses,
      nightToggleLabel: showNightClasses ? '야간수업 접기' : '야간수업 펼치기',
      rows: todayRows,
    },
  };
};

export const useTimetableDetailData = (
  initialMode: TimetableDetailViewMode = 'all',
) => {
  const [activeMode, setActiveMode] =
    React.useState<TimetableDetailViewMode>(initialMode);
  const [activeTab, setActiveTab] = React.useState<'manual' | 'search'>('search');
  const [addSheetVisible, setAddSheetVisible] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [manualDraft, setManualDraft] =
    React.useState<TimetableManualCourseDraft>(DEFAULT_MANUAL_DRAFT);
  const [query, setQuery] = React.useState('');
  const [record, setRecord] = React.useState<TimetableSemesterRecord | null>(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>();
  const [selectedSemesterId, setSelectedSemesterId] = React.useState<string>();
  const [selectedToneId, setSelectedToneId] =
    React.useState<TimetableCourseToneId>('green');
  const [semesterOptions, setSemesterOptions] = React.useState<
    {id: string; label: string}[]
  >([]);
  const [showNightClasses, setShowNightClasses] = React.useState(false);
  const selectedSemesterIdRef = React.useRef<string | undefined>(undefined);

  const loadSemester = React.useCallback(async (semesterId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const semesters = await timetableDetailRepository.listSemesterRecords();
      const options = semesters.map(semester => ({
        id: semester.id,
        label: semester.label,
      }));
      const nextSemesterId =
        semesterId ?? selectedSemesterIdRef.current ?? semesters[0]?.id;

      setSemesterOptions(options);

      if (!nextSemesterId) {
        selectedSemesterIdRef.current = undefined;
        setRecord(null);
        setSelectedSemesterId(undefined);
        return;
      }

      const nextRecord =
        semesters.find(semester => semester.id === nextSemesterId) ??
        (await timetableDetailRepository.getSemesterRecord(nextSemesterId));

      selectedSemesterIdRef.current = nextSemesterId;
      setRecord(nextRecord ?? null);
      setSelectedSemesterId(nextSemesterId);
    } catch (loadError) {
      console.error(loadError);
      setError('시간표를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSemester().catch(() => undefined);
  }, [loadSemester]);

  const resetManualDraft = React.useCallback(() => {
    setManualDraft(previousDraft => ({
      ...DEFAULT_MANUAL_DRAFT,
      toneId: previousDraft.toneId,
    }));
  }, []);

  const closeAddSheet = React.useCallback(() => {
    setAddSheetVisible(false);
    setQuery('');
    setActiveTab('search');
    resetManualDraft();
  }, [resetManualDraft]);

  const openAddSheet = React.useCallback(() => {
    setSelectedCourseId(undefined);
    setAddSheetVisible(true);
  }, []);

  const closeCourseDetail = React.useCallback(() => {
    setSelectedCourseId(undefined);
  }, []);

  const openCourseDetail = React.useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  const refreshRecord = React.useCallback((nextRecord: TimetableSemesterRecord | null) => {
    setRecord(nextRecord);
  }, []);

  const addCatalogCourse = React.useCallback(
    async (courseId: string) => {
      if (!record || !selectedSemesterId) {
        return;
      }

      const targetCourse = record.catalogCourses.find(course => course.id === courseId);

      if (!targetCourse) {
        return;
      }

      if (record.courses.some(course => course.id === courseId)) {
        Alert.alert('이미 추가된 강의입니다', '현재 시간표에 이미 포함된 강의입니다.');
        return;
      }

      const conflictIds = findConflictCourseIds(targetCourse, record.courses);
      const applyAdd = () =>
        timetableDetailRepository.addCatalogCourse({
          courseId,
          replaceCourseIds: conflictIds,
          semesterId: selectedSemesterId,
          toneId: selectedToneId,
        });

      if (conflictIds.length > 0) {
        Alert.alert(
          '시간이 겹치는 강의가 있습니다',
          '기존 강의를 대체하고 새 강의를 추가할까요?',
          [
            {text: '취소', style: 'cancel'},
            {
              text: '대체하기',
              style: 'destructive',
              onPress: () => {
                applyAdd()
                  .then(nextRecord => {
                    refreshRecord(nextRecord);
                    closeAddSheet();
                    Alert.alert(
                      '강의 추가',
                      `"${targetCourse.name}" 강의를 시간표에 추가했습니다.`,
                    );
                  })
                  .catch(() => undefined);
              },
            },
          ],
        );
        return;
      }

      const nextRecord = await applyAdd();
      refreshRecord(nextRecord);
      closeAddSheet();
    },
    [
      closeAddSheet,
      record,
      refreshRecord,
      selectedSemesterId,
      selectedToneId,
    ],
  );

  const addManualCourse = React.useCallback(async () => {
    if (!record || !selectedSemesterId) {
      return;
    }

    if (
      manualDraft.name.trim().length === 0 ||
      (!manualDraft.isOnline && manualDraft.locationLabel.trim().length === 0)
    ) {
      return;
    }

    const nextCourse: TimetableCourseRecord = {
      code: '직접 입력',
      credits: manualDraft.credits,
      id: 'manual-preview',
      isOnline: manualDraft.isOnline,
      locationLabel: manualDraft.locationLabel,
      name: manualDraft.name,
      professor: manualDraft.professor || '직접 입력',
      schedules: manualDraft.isOnline
        ? []
        : [
            {
              day: manualDraft.day,
              endPeriod: manualDraft.endPeriod,
              startPeriod: manualDraft.startPeriod,
            },
          ],
      toneId: manualDraft.toneId,
    };
    const conflictIds = findConflictCourseIds(nextCourse, record.courses);
    const applyAdd = () =>
      timetableDetailRepository.addManualCourse({
        draft: manualDraft,
        replaceCourseIds: conflictIds,
        semesterId: selectedSemesterId,
      });

      if (conflictIds.length > 0) {
      Alert.alert(
        '시간이 겹치는 강의가 있습니다',
        '겹치는 강의를 대체하고 직접 입력한 강의를 추가할까요?',
        [
          {text: '취소', style: 'cancel'},
          {
            text: '대체하기',
            style: 'destructive',
            onPress: () => {
              applyAdd()
                .then(nextRecord => {
                  refreshRecord(nextRecord);
                  closeAddSheet();
                  Alert.alert(
                    '강의 추가',
                    `"${manualDraft.name}" 강의를 시간표에 추가했습니다.`,
                  );
                })
                .catch(() => undefined);
            },
          },
        ],
      );
      return;
    }

    const nextRecord = await applyAdd();
    refreshRecord(nextRecord);
    closeAddSheet();
  }, [
    closeAddSheet,
    manualDraft,
    record,
    refreshRecord,
    selectedSemesterId,
  ]);

  const removeSelectedCourse = React.useCallback(() => {
    if (!selectedCourseId || !selectedSemesterId || !record) {
      return;
    }

    const course = record.courses.find(item => item.id === selectedCourseId);

    if (!course) {
      return;
    }

    Alert.alert('강의 삭제', `"${course.name}" 강의를 삭제할까요?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          timetableDetailRepository
            .removeCourse({
              courseId: selectedCourseId,
              semesterId: selectedSemesterId,
            })
            .then(nextRecord => {
              refreshRecord(nextRecord);
              setSelectedCourseId(undefined);
            })
            .catch(() => undefined);
        },
      },
    ]);
  }, [record, refreshRecord, selectedCourseId, selectedSemesterId]);

  const shareTimetable = React.useCallback(async () => {
    if (!record) {
      return;
    }

    const message = [
      `${record.label} 시간표`,
      ...record.courses.map(course => `- ${course.name} (${course.credits}학점)`),
    ].join('\n');

    await Share.share({message});
  }, [record]);

  const data = React.useMemo(() => {
    if (!record) {
      return undefined;
    }

    const viewData = buildScreenViewData({
      activeMode,
      activeTab,
      courses: record.courses,
      currentDay: record.currentDay,
      manualDraft,
      query,
      record,
      selectedCourseId,
      selectedToneId,
      showNightClasses,
    });

    return {
      ...viewData,
      semesterOptions,
    };
  }, [
    activeMode,
    activeTab,
    manualDraft,
    query,
    record,
    selectedCourseId,
    selectedToneId,
    semesterOptions,
    showNightClasses,
  ]);

  return {
    activeMode,
    addCatalogCourse,
    addManualCourse,
    addSheetVisible,
    closeAddSheet,
    closeCourseDetail,
    data,
    error,
    loading,
    openAddSheet,
    openCourseDetail,
    reload: () => loadSemester(selectedSemesterId),
    removeSelectedCourse,
    selectColor: (colorId: TimetableCourseToneId) => {
      setSelectedToneId(colorId);
      setManualDraft(previousDraft => ({
        ...previousDraft,
        toneId: colorId,
      }));
    },
    selectMode: (mode: TimetableDetailViewMode) => {
      setActiveMode(mode);
      setSelectedCourseId(undefined);
    },
    selectSemester: async (semesterId: string) => {
      setSelectedCourseId(undefined);
      setShowNightClasses(false);
      await loadSemester(semesterId);
    },
    setAddSheetTab: (tab: 'manual' | 'search') => setActiveTab(tab),
    setManualCredits: (credits: number) =>
      setManualDraft(previousDraft => ({
        ...previousDraft,
        credits,
      })),
    setManualDay: (day: TimetableWeekdayId) =>
      setManualDraft(previousDraft => ({
        ...previousDraft,
        day,
      })),
    setManualEndPeriod: (delta: -1 | 1) =>
      setManualDraft(previousDraft => {
        const nextEndPeriod = Math.min(
          15,
          Math.max(previousDraft.startPeriod, previousDraft.endPeriod + delta),
        );

        return {
          ...previousDraft,
          endPeriod: nextEndPeriod,
        };
      }),
    setManualField: (
      field: 'locationLabel' | 'name' | 'professor',
      value: string,
    ) =>
      setManualDraft(previousDraft => ({
        ...previousDraft,
        [field]: value,
      })),
    setManualOnline: (enabled: boolean) =>
      setManualDraft(previousDraft => ({
        ...previousDraft,
        isOnline: enabled,
        locationLabel: enabled ? '' : previousDraft.locationLabel,
      })),
    setManualStartPeriod: (delta: -1 | 1) =>
      setManualDraft(previousDraft => {
        const nextStartPeriod = Math.max(
          1,
          Math.min(previousDraft.startPeriod + delta, previousDraft.endPeriod),
        );

        return {
          ...previousDraft,
          startPeriod: nextStartPeriod,
        };
      }),
    setQuery,
    shareTimetable,
    toggleNightClasses: () => setShowNightClasses(previousValue => !previousValue),
  };
};

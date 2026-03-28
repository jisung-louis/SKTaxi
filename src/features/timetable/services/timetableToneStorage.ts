import AsyncStorage from '@react-native-async-storage/async-storage';

import type {TimetableCourseToneId} from '../model/timetableDetailViewData';

const TIMETABLE_TONE_STORAGE_KEY = '@sktaxi/timetable-course-tones/v1';

type TimetableToneStore = Record<string, Record<string, TimetableCourseToneId>>;

let toneStoreCache: TimetableToneStore | null = null;

const readToneStore = async (): Promise<TimetableToneStore> => {
  if (toneStoreCache) {
    return toneStoreCache;
  }

  try {
    const stored = await AsyncStorage.getItem(TIMETABLE_TONE_STORAGE_KEY);

    if (!stored) {
      toneStoreCache = {};
      return toneStoreCache;
    }

    const parsed = JSON.parse(stored) as TimetableToneStore;
    toneStoreCache = parsed && typeof parsed === 'object' ? parsed : {};
    return toneStoreCache;
  } catch (error) {
    console.warn('시간표 색상 설정을 불러오지 못했습니다.', error);
    toneStoreCache = {};
    return toneStoreCache;
  }
};

const persistToneStore = async (store: TimetableToneStore) => {
  toneStoreCache = store;
  await AsyncStorage.setItem(TIMETABLE_TONE_STORAGE_KEY, JSON.stringify(store));
};

export const getTimetableCourseToneMap = async (
  semesterId: string,
): Promise<Record<string, TimetableCourseToneId>> => {
  const store = await readToneStore();
  return {...(store[semesterId] ?? {})};
};

export const setTimetableCourseTone = async (
  semesterId: string,
  courseId: string,
  toneId: TimetableCourseToneId,
) => {
  const store = await readToneStore();
  const nextStore: TimetableToneStore = {
    ...store,
    [semesterId]: {
      ...(store[semesterId] ?? {}),
      [courseId]: toneId,
    },
  };

  await persistToneStore(nextStore);
};

export const removeTimetableCourseTone = async (
  semesterId: string,
  courseId: string,
) => {
  const store = await readToneStore();
  const semesterToneMap = {...(store[semesterId] ?? {})};

  if (!(courseId in semesterToneMap)) {
    return;
  }

  delete semesterToneMap[courseId];

  const nextStore: TimetableToneStore = {
    ...store,
  };

  if (Object.keys(semesterToneMap).length === 0) {
    delete nextStore[semesterId];
  } else {
    nextStore[semesterId] = semesterToneMap;
  }

  await persistToneStore(nextStore);
};

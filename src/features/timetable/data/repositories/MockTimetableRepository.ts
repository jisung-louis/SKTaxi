import type {
  ITimetableRepository,
  Timetable,
} from './ITimetableRepository';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {createTimetableDetailMockData} from '../../mocks/timetableDetail.mock';

const timetables = new Map<string, Timetable>();
const subscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Timetable | null>>
>();

const buildKey = (userId: string, semester: string) => `${userId}:${semester}`;

const DEFAULT_TIMETABLE_COURSES_BY_SEMESTER = new Map(
  createTimetableDetailMockData().map(semesterRecord => [
    semesterRecord.id,
    semesterRecord.courses.map(course => course.id),
  ]),
);

const emitTimetable = (key: string) => {
  const timetable = timetables.get(key) ?? null;
  subscribers.get(key)?.forEach(callbacks => {
    callbacks.onData(timetable ? { ...timetable, courses: [...timetable.courses] } : null);
  });
};

const ensureSeededTimetable = (userId: string, semester: string) => {
  const key = buildKey(userId, semester);

  if (timetables.has(key)) {
    return;
  }

  const defaultCourses = DEFAULT_TIMETABLE_COURSES_BY_SEMESTER.get(semester);

  if (!defaultCourses) {
    return;
  }

  timetables.set(key, {
    userId,
    semester,
    courses: [...defaultCourses],
    updatedAt: new Date(),
  });
};

export class MockTimetableRepository implements ITimetableRepository {
  subscribeToTimetable(
    userId: string,
    semester: string,
    callbacks: SubscriptionCallbacks<Timetable | null>,
  ): Unsubscribe {
    ensureSeededTimetable(userId, semester);
    const key = buildKey(userId, semester);
    const bucket = subscribers.get(key) ?? new Set();
    bucket.add(callbacks);
    subscribers.set(key, bucket);
    callbacks.onData(timetables.get(key) ?? null);

    return () => {
      subscribers.get(key)?.delete(callbacks);
    };
  }

  async updateCourseIds(
    userId: string,
    semester: string,
    courseIds: string[],
  ): Promise<void> {
    const key = buildKey(userId, semester);
    timetables.set(key, {
      userId,
      semester,
      courses: [...courseIds],
      updatedAt: new Date(),
    });
    emitTimetable(key);
  }
}

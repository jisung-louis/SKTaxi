import type {
  ITimetableRepository,
  Timetable,
} from './ITimetableRepository';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

const timetables = new Map<string, Timetable>();
const subscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Timetable | null>>
>();

const buildKey = (userId: string, semester: string) => `${userId}:${semester}`;

const emitTimetable = (key: string) => {
  const timetable = timetables.get(key) ?? null;
  subscribers.get(key)?.forEach(callbacks => {
    callbacks.onData(timetable ? { ...timetable, courses: [...timetable.courses] } : null);
  });
};

export class MockTimetableRepository implements ITimetableRepository {
  subscribeToTimetable(
    userId: string,
    semester: string,
    callbacks: SubscriptionCallbacks<Timetable | null>,
  ): Unsubscribe {
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

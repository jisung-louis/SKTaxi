import type { ICafeteriaRepository } from './ICafeteriaRepository';
import {
  formatLocalDateKey,
  type WeeklyMenu,
} from '../../model/cafeteria';

const MOCK_WEEKLY_MENU_TITLES = {
  rollNoodles: ['계란라면(신)', '유부우동', '치즈순살돈가스버거'],
  theBab: ['새우볶음밥', '마그마폭립덮밥', '치킨마요덮밥'],
  fryRice: ['카레돈까스', '치킨치즈까스', '왕돈까스'],
} as const;

const buildCurrentWeekMenu = (): WeeklyMenu => {
  const now = new Date();
  const weekStartDate = new Date(now);
  weekStartDate.setHours(0, 0, 0, 0);
  weekStartDate.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const dayKeys = Array.from({ length: 5 }, (_, index) => {
    const day = new Date(weekStartDate);
    day.setDate(weekStartDate.getDate() + index);
    return formatLocalDateKey(day);
  });

  const fillMenu = (titles: string[]) =>
    dayKeys.reduce<Record<string, string[]>>((accumulator, dateKey) => {
      accumulator[dateKey] = [...titles];
      return accumulator;
    }, {});

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 4);

  return {
    id: `${weekStartDate.getFullYear()}-W${String(Math.ceil((weekStartDate.getDate() + 6) / 7)).padStart(2, '0')}`,
    weekStart: formatLocalDateKey(weekStartDate),
    weekEnd: formatLocalDateKey(weekEndDate),
    rollNoodles: fillMenu([...MOCK_WEEKLY_MENU_TITLES.rollNoodles]),
    theBab: fillMenu([...MOCK_WEEKLY_MENU_TITLES.theBab]),
    fryRice: fillMenu([...MOCK_WEEKLY_MENU_TITLES.fryRice]),
    createdAt: new Date(weekStartDate),
    updatedAt: new Date(),
  };
};

const currentWeekMenu = buildCurrentWeekMenu();

export class MockCafeteriaRepository implements ICafeteriaRepository {
  async getWeeklyMenu(weekId: string): Promise<WeeklyMenu | null> {
    if (weekId !== currentWeekMenu.id) {
      return null;
    }

    return {
      ...currentWeekMenu,
      rollNoodles: { ...currentWeekMenu.rollNoodles },
      theBab: { ...currentWeekMenu.theBab },
      fryRice: { ...currentWeekMenu.fryRice },
    };
  }

  async getCurrentWeekMenu(): Promise<WeeklyMenu | null> {
    return this.getWeeklyMenu(currentWeekMenu.id);
  }
}

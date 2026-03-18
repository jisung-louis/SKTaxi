import type { ICafeteriaRepository } from './ICafeteriaRepository';
import type { WeeklyMenu } from '../../model/cafeteria';
import { cafeteriaDetailMockData } from '../../mocks/cafeteriaDetail.mock';

const buildCurrentWeekMenu = (): WeeklyMenu => {
  const now = new Date();
  const weekStartDate = new Date(now);
  weekStartDate.setHours(0, 0, 0, 0);
  weekStartDate.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const dayKeys = Array.from({ length: 5 }, (_, index) => {
    const day = new Date(weekStartDate);
    day.setDate(weekStartDate.getDate() + index);
    return day.toISOString().slice(0, 10);
  });

  const pickTitles = (categoryId: string) =>
    cafeteriaDetailMockData.categories
      .find(category => category.id === categoryId)
      ?.items.slice(0, 3)
      .map(item => item.title) ?? [];

  const fillMenu = (titles: string[]) =>
    dayKeys.reduce<Record<string, string[]>>((accumulator, dateKey) => {
      accumulator[dateKey] = [...titles];
      return accumulator;
    }, {});

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 4);

  return {
    id: `${weekStartDate.getFullYear()}-W${String(Math.ceil((weekStartDate.getDate() + 6) / 7)).padStart(2, '0')}`,
    weekStart: weekStartDate.toISOString().slice(0, 10),
    weekEnd: weekEndDate.toISOString().slice(0, 10),
    rollNoodles: fillMenu(pickTitles('rollNoodles')),
    theBab: fillMenu(pickTitles('theBab')),
    fryRice: fillMenu(pickTitles('fryRice')),
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

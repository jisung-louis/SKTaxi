import type {
  AcademicScheduleDto,
  CafeteriaMenuDto,
} from '../dto/campusDto';
import type {AcademicSchedule} from '../../model/academic';
import type {WeeklyMenu} from '../../model/cafeteria';

export const mapAcademicScheduleDto = (
  dto: AcademicScheduleDto,
): AcademicSchedule => ({
  createdAt: new Date(dto.startDate),
  description: dto.description ?? undefined,
  endDate: dto.endDate,
  id: dto.id,
  isPrimary: dto.isPrimary,
  startDate: dto.startDate,
  title: dto.title,
  type: dto.type === 'SINGLE' ? 'single' : 'multi',
  updatedAt: new Date(dto.endDate),
});

const getCategoryMenus = (
  menus: CafeteriaMenuDto['menus'],
  category: 'rollNoodles' | 'theBab' | 'fryRice',
) =>
  Object.entries(menus).reduce<Record<string, string[]>>((result, [date, values]) => {
    result[date] = values[category] ?? [];
    return result;
  }, {});

export const mapCafeteriaMenuDto = (dto: CafeteriaMenuDto): WeeklyMenu => ({
  createdAt: new Date(dto.weekStart),
  fryRice: getCategoryMenus(dto.menus, 'fryRice'),
  id: dto.weekId,
  rollNoodles: getCategoryMenus(dto.menus, 'rollNoodles'),
  theBab: getCategoryMenus(dto.menus, 'theBab'),
  updatedAt: new Date(dto.weekEnd),
  weekEnd: dto.weekEnd,
  weekStart: dto.weekStart,
});

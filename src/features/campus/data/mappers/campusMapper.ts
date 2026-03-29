import type {CampusStackParamList} from '@/app/navigation/types';
import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import type {
  AcademicScheduleDto,
  CampusBannerActionTargetDto,
  CampusBannerResponseDto,
  CafeteriaMenuCategoryDto,
  CafeteriaMenuDto,
  CafeteriaMenuEntryDto,
} from '../dto/campusDto';
import type {AcademicSchedule} from '../../model/academic';
import {
  CAFETERIA_CATEGORIES,
  type CafeteriaMenuCategoryDefinition,
  type CafeteriaMenuEntry,
  type StructuredMenuEntries,
  type WeeklyMenu,
} from '../../model/cafeteria';
import type {
  CampusBannerInAppAction,
  CampusBannerSourceData,
} from '../../model/campusHomeBanner';

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
  Object.entries(menus).reduce<Record<string, string[]>>(
    (result, [date, values]) => {
      result[date] = values[category] ?? [];
      return result;
    },
    {},
  );

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
};

const buildFallbackCategories = (): CafeteriaMenuCategoryDefinition[] =>
  CAFETERIA_CATEGORIES.map(category => ({
    code: category.id,
    label: category.name,
  }));

const mapCategories = (
  categories?: CafeteriaMenuCategoryDto[],
): CafeteriaMenuCategoryDefinition[] => {
  const mappedCategories =
    categories?.flatMap(category => {
      const code = normalizeOptionalText(category.code);
      const label = normalizeOptionalText(category.label);

      if (!code || !label) {
        return [];
      }

      return [{code, label}];
    }) ?? [];

  if (mappedCategories.length === 0) {
    return buildFallbackCategories();
  }

  return mappedCategories;
};

const synthesizeStructuredMenuEntries = (
  menus: CafeteriaMenuDto['menus'],
  categories: CafeteriaMenuCategoryDefinition[],
): StructuredMenuEntries =>
  Object.entries(menus).reduce<StructuredMenuEntries>(
    (result, [date, values]) => {
      result[date] = categories.reduce<Record<string, CafeteriaMenuEntry[]>>(
        (categoryAccumulator, category) => {
          categoryAccumulator[category.code] = (values[category.code] ?? [])
            .map(title => title.trim())
            .filter(Boolean)
            .map((title, index) => ({
              badges: [],
              dislikeCount: 0,
              id: `${date}-${category.code}-${index + 1}`,
              likeCount: 0,
              title,
            }));
          return categoryAccumulator;
        },
        {},
      );
      return result;
    },
    {},
  );

const mapStructuredMenuEntries = (
  dto: CafeteriaMenuDto,
  categories: CafeteriaMenuCategoryDefinition[],
): StructuredMenuEntries => {
  if (!dto.menuEntries) {
    return synthesizeStructuredMenuEntries(dto.menus, categories);
  }

  return Object.entries(dto.menuEntries).reduce<StructuredMenuEntries>(
    (result, [date, categoryEntries]) => {
      result[date] = categories.reduce<Record<string, CafeteriaMenuEntry[]>>(
        (categoryAccumulator, category) => {
          categoryAccumulator[category.code] = (
            categoryEntries[category.code] ?? []
          ).flatMap((entry, index) => {
            const mappedEntry = mapStructuredMenuEntry(
              date,
              category.code,
              entry,
              index,
            );

            return mappedEntry ? [mappedEntry] : [];
          });
          return categoryAccumulator;
        },
        {},
      );

      Object.entries(categoryEntries).forEach(([categoryCode, entries]) => {
        if (result[date][categoryCode]) {
          return;
        }

        result[date][categoryCode] = entries.flatMap((entry, index) => {
          const mappedEntry = mapStructuredMenuEntry(
            date,
            categoryCode,
            entry,
            index,
          );

          return mappedEntry ? [mappedEntry] : [];
        });
      });

      return result;
    },
    {},
  );
};

const mapStructuredMenuEntry = (
  date: string,
  categoryCode: string,
  entry: CafeteriaMenuEntryDto,
  index: number,
): CafeteriaMenuEntry | null => {
  const title = normalizeOptionalText(entry.title);

  if (!title) {
    return null;
  }

  const likeCount =
    typeof entry.likeCount === 'number' && entry.likeCount >= 0
      ? entry.likeCount
      : 0;
  const dislikeCount =
    typeof entry.dislikeCount === 'number' && entry.dislikeCount >= 0
      ? entry.dislikeCount
      : 0;

  return {
    badges: (entry.badges ?? []).flatMap(badge => {
      const label = normalizeOptionalText(badge.label);

      if (!label) {
        return [];
      }

      return [
        {
          code: normalizeOptionalText(badge.code) ?? label,
          label,
        },
      ];
    }),
    dislikeCount,
    id:
      normalizeOptionalText(entry.id) ?? `${date}-${categoryCode}-${index + 1}`,
    likeCount,
    title,
  };
};

export const mapCafeteriaMenuDto = (dto: CafeteriaMenuDto): WeeklyMenu => {
  const categories = mapCategories(dto.categories);

  return {
    categories,
    createdAt: new Date(dto.weekStart),
    fryRice: getCategoryMenus(dto.menus, 'fryRice'),
    id: dto.weekId,
    menuEntries: mapStructuredMenuEntries(dto, categories),
    rollNoodles: getCategoryMenus(dto.menus, 'rollNoodles'),
    theBab: getCategoryMenus(dto.menus, 'theBab'),
    updatedAt: new Date(dto.weekEnd),
    weekEnd: dto.weekEnd,
    weekStart: dto.weekStart,
  };
};

const trimToNull = (value?: string | null) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

const normalizeRequiredText = (
  value: string | null | undefined,
  fieldName: string,
) => {
  const trimmed = trimToNull(value);

  if (!trimmed) {
    throw new RepositoryError(
      RepositoryErrorCode.DATA_CORRUPTED,
      `캠퍼스 배너 응답에 ${fieldName}이 없습니다.`,
    );
  }

  return trimmed;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getRecordString = (record: Record<string, unknown>, key: string) => {
  const value = record[key];

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const getTimetableDetailParams = (
  params: Record<string, unknown>,
): CampusStackParamList['TimetableDetail'] => {
  const nextParams: NonNullable<CampusStackParamList['TimetableDetail']> = {};

  if (params.initialView === 'today' || params.initialView === 'all') {
    nextParams.initialView = params.initialView;
  }

  if (params.mode === 'edit') {
    nextParams.mode = 'edit';
  }

  return Object.keys(nextParams).length > 0 ? nextParams : undefined;
};

const getCafeteriaDetailParams = (
  params: Record<string, unknown>,
): CampusStackParamList['CafeteriaDetail'] | undefined => {
  const scrollToCategory = getRecordString(params, 'scrollToCategory');

  return scrollToCategory ? {scrollToCategory} : undefined;
};

const getAcademicCalendarDetailParams = (
  params: Record<string, unknown>,
): CampusStackParamList['AcademicCalendarDetail'] => {
  const initialDate = getRecordString(params, 'initialDate');
  const scheduleId = getRecordString(params, 'scheduleId');

  if (!initialDate && !scheduleId) {
    return undefined;
  }

  return {
    initialDate,
    scheduleId,
  };
};

const normalizeInAppAction = ({
  actionParams,
  actionTarget,
}: Pick<
  CampusBannerResponseDto,
  'actionParams' | 'actionTarget'
>): CampusBannerInAppAction => {
  if (!actionTarget) {
    throw new RepositoryError(
      RepositoryErrorCode.DATA_CORRUPTED,
      '캠퍼스 배너 IN_APP 응답에 actionTarget이 없습니다.',
    );
  }

  const params = isRecord(actionParams) ? actionParams : {};

  switch (actionTarget) {
    case 'TAXI_MAIN':
      return {
        target: 'TAXI_MAIN',
        type: 'inApp' as const,
      };
    case 'NOTICE_MAIN':
      return {
        target: 'NOTICE_MAIN',
        type: 'inApp' as const,
      };
    case 'TIMETABLE_DETAIL':
      return {
        params: getTimetableDetailParams(params),
        target: 'TIMETABLE_DETAIL',
        type: 'inApp' as const,
      };
    case 'CAFETERIA_DETAIL':
      return {
        params: getCafeteriaDetailParams(params),
        target: 'CAFETERIA_DETAIL',
        type: 'inApp' as const,
      };
    case 'ACADEMIC_CALENDAR_DETAIL':
      return {
        params: getAcademicCalendarDetailParams(params),
        target: 'ACADEMIC_CALENDAR_DETAIL',
        type: 'inApp' as const,
      };
    default: {
      const unreachableTarget: never = actionTarget;

      throw new RepositoryError(
        RepositoryErrorCode.DATA_CORRUPTED,
        `지원하지 않는 캠퍼스 배너 actionTarget입니다: ${
          unreachableTarget as CampusBannerActionTargetDto
        }`,
      );
    }
  }
};

export const mapCampusBannerDto = (
  dto: CampusBannerResponseDto,
): CampusBannerSourceData => {
  const badgeLabel = normalizeRequiredText(dto.badgeLabel, 'badgeLabel');
  const titleLabel = normalizeRequiredText(dto.titleLabel, 'titleLabel');
  const descriptionLabel = normalizeRequiredText(
    dto.descriptionLabel,
    'descriptionLabel',
  );
  const buttonLabel = normalizeRequiredText(dto.buttonLabel, 'buttonLabel');
  const id = normalizeRequiredText(dto.id, 'id');
  const imageUrl = trimToNull(dto.imageUrl) ?? '';

  if (dto.actionType === 'EXTERNAL_URL') {
    const actionUrl = normalizeRequiredText(dto.actionUrl, 'actionUrl');

    return {
      action: {
        type: 'externalUrl',
        url: actionUrl,
      },
      badgeLabel,
      buttonLabel,
      descriptionLabel,
      id,
      imageUrl,
      paletteKey: dto.paletteKey,
      titleLabel,
    };
  }

  return {
    action: normalizeInAppAction(dto),
    badgeLabel,
    buttonLabel,
    descriptionLabel,
    id,
    imageUrl,
    paletteKey: dto.paletteKey,
    titleLabel,
  };
};

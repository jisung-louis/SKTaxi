import type {CampusCafeteriaRecommendedMenuViewData} from '../model/campusHome';
import {
  CAFETERIA_CATEGORIES,
  type CafeteriaMenuBadge,
  type CafeteriaMenuCategoryDefinition,
  type CafeteriaMenuEntry,
  type WeeklyMenu,
} from '../model/cafeteria';
import type {CafeteriaCategoryId} from '../model/cafeteriaDetailSource';

export interface CafeteriaMenuSummaryBadge {
  id: string;
  label: string;
}

export interface CafeteriaMenuSummaryItem {
  badges: CafeteriaMenuSummaryBadge[];
  dislikeCount: number;
  id: string;
  likeCount: number;
  title: string;
}

export interface CafeteriaMenuSummarySection {
  id: CafeteriaCategoryId;
  items: CafeteriaMenuSummaryItem[];
  title: string;
}

const formatCountLabel = (count: number) =>
  new Intl.NumberFormat('ko-KR').format(count);

const getFallbackCategories = (): CafeteriaMenuCategoryDefinition[] =>
  CAFETERIA_CATEGORIES.map(category => ({
    code: category.id,
    label: category.name,
  }));

const getOrderedCategories = (
  menu: WeeklyMenu,
): CafeteriaMenuCategoryDefinition[] =>
  menu.categories.length > 0 ? menu.categories : getFallbackCategories();

const dedupeEntriesByTitle = (entries: CafeteriaMenuEntry[]) => {
  const entryByTitle = new Map<string, CafeteriaMenuEntry>();

  entries.forEach(entry => {
    const key = entry.title.trim();

    if (!key || entryByTitle.has(key)) {
      return;
    }

    entryByTitle.set(key, entry);
  });

  return [...entryByTitle.values()];
};

const collectCategoryEntries = (
  menu: WeeklyMenu,
  categoryCode: string,
): CafeteriaMenuEntry[] =>
  dedupeEntriesByTitle(
    Object.values(menu.menuEntries).flatMap(
      categories => categories[categoryCode] ?? [],
    ),
  );

const toSummaryBadges = (itemId: string, badges: CafeteriaMenuBadge[]) =>
  badges.map((badge, index) => ({
    id: `${itemId}-badge-${badge.code || index}`,
    label: badge.label,
  }));

const pickRepresentativeEntriesForDate = (
  menu: WeeklyMenu,
  dateKey: string,
  categoryCode: string,
) => {
  const entriesForDate = menu.menuEntries[dateKey]?.[categoryCode] ?? [];

  if (entriesForDate.length > 0) {
    return entriesForDate;
  }

  return (
    Object.values(menu.menuEntries).find(
      categories => (categories[categoryCode] ?? []).length > 0,
    )?.[categoryCode] ?? []
  );
};

const compareRecommendedEntries = (
  left: CafeteriaMenuEntry,
  right: CafeteriaMenuEntry,
) =>
  right.likeCount - left.likeCount ||
  left.title.localeCompare(right.title, 'ko-KR');

export const buildCafeteriaDetailSections = ({
  menu,
}: {
  menu: WeeklyMenu;
}): CafeteriaMenuSummarySection[] =>
  getOrderedCategories(menu)
    .map(category => {
      const items = collectCategoryEntries(menu, category.code);

      return {
        id: category.code,
        items: items.map(item => ({
          badges: toSummaryBadges(item.id, item.badges),
          dislikeCount: item.dislikeCount,
          id: item.id,
          likeCount: item.likeCount,
          title: item.title,
        })),
        title: category.label,
      };
    })
    .filter(section => section.items.length > 0);

export const buildCampusRecommendedMenus = ({
  menu,
  currentDate,
}: {
  currentDate: string;
  menu: WeeklyMenu;
}): CampusCafeteriaRecommendedMenuViewData[] =>
  getOrderedCategories(menu)
    .map(category => {
      const entries = pickRepresentativeEntriesForDate(
        menu,
        currentDate,
        category.code,
      );
      const selectedEntry = [...entries].sort(compareRecommendedEntries)[0];

      if (!selectedEntry) {
        return null;
      }

      return {
        categoryCode: category.code,
        categoryLabel: category.label,
        id: selectedEntry.id,
        likeCountLabel: formatCountLabel(selectedEntry.likeCount),
        title: selectedEntry.title,
      };
    })
    .filter(
      (item): item is CampusCafeteriaRecommendedMenuViewData => item !== null,
    );

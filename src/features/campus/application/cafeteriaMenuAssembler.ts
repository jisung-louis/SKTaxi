import type {CampusCafeteriaRecommendedMenuViewData} from '../model/campusHome';
import {
  CAFETERIA_CATEGORIES,
  getMenuForDate,
  type MenuItems,
  type WeeklyMenu,
} from '../model/cafeteria';
import type {
  CafeteriaMenuBadgeTone,
  CafeteriaCategoryId,
} from '../model/cafeteriaDetailSource';

export interface CafeteriaMenuSummaryBadge {
  id: string;
  label: string;
  tone: CafeteriaMenuBadgeTone;
}

export interface CafeteriaMenuSummaryItem {
  badges: CafeteriaMenuSummaryBadge[];
  id: string;
  metaLabel: string;
  title: string;
}

export interface CafeteriaMenuSummarySection {
  id: CafeteriaCategoryId;
  items: CafeteriaMenuSummaryItem[];
  title: string;
}

interface MenuFrequency {
  count: number;
  servedToday: boolean;
  title: string;
}

const CATEGORY_IDS = CAFETERIA_CATEGORIES.map(
  category => category.id as CafeteriaCategoryId,
);

const CATEGORY_TITLE_MAP = CAFETERIA_CATEGORIES.reduce<
  Record<CafeteriaCategoryId, string>
>((accumulator, category) => {
  accumulator[category.id as CafeteriaCategoryId] = category.name;
  return accumulator;
}, {} as Record<CafeteriaCategoryId, string>);

const normalizeMenuItemId = (categoryId: CafeteriaCategoryId, title: string) =>
  `${categoryId}-${title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')}`;

const buildMenuFrequencies = (
  menuItems: MenuItems,
  currentDate: string,
): MenuFrequency[] => {
  const frequencyByTitle = new Map<string, MenuFrequency>();

  Object.entries(menuItems).forEach(([dateKey, titles]) => {
    titles.forEach(rawTitle => {
      const title = rawTitle.trim();

      if (!title) {
        return;
      }

      const current = frequencyByTitle.get(title) ?? {
        count: 0,
        servedToday: false,
        title,
      };

      current.count += 1;
      current.servedToday ||= dateKey === currentDate;
      frequencyByTitle.set(title, current);
    });
  });

  return [...frequencyByTitle.values()].sort(
    (left, right) =>
      Number(right.servedToday) - Number(left.servedToday) ||
      right.count - left.count ||
      left.title.localeCompare(right.title, 'ko-KR'),
  );
};

const buildMenuBadges = (
  itemId: string,
  frequency: MenuFrequency,
): CafeteriaMenuSummaryBadge[] => {
  const badges: CafeteriaMenuSummaryBadge[] = [];

  if (frequency.servedToday) {
    badges.push({
      id: `${itemId}-today`,
      label: '오늘',
      tone: 'blue',
    });
  }

  if (frequency.count > 1) {
    badges.push({
      id: `${itemId}-weekly`,
      label: `주간 ${frequency.count}회`,
      tone: 'brand',
    });
  }

  return badges;
};

const buildMenuMetaLabel = (frequency: MenuFrequency) => {
  if (frequency.servedToday) {
    return frequency.count > 1
      ? `오늘 포함 주간 ${frequency.count}회 제공`
      : '오늘 제공';
  }

  return `이번 주 ${frequency.count}회 제공`;
};

const getCategoryMenuItems = (
  menu: WeeklyMenu,
  categoryId: CafeteriaCategoryId,
) => {
  switch (categoryId) {
    case 'rollNoodles':
      return menu.rollNoodles;
    case 'theBab':
      return menu.theBab;
    case 'fryRice':
    default:
      return menu.fryRice;
  }
};

export const buildCafeteriaDetailSections = ({
  menu,
  currentDate,
}: {
  currentDate: string;
  menu: WeeklyMenu;
}): CafeteriaMenuSummarySection[] =>
  CATEGORY_IDS.map(categoryId => {
    const menuItems = getCategoryMenuItems(menu, categoryId);
    const frequencies = buildMenuFrequencies(menuItems, currentDate);

    return {
      id: categoryId,
      items: frequencies.map(frequency => {
        const itemId = normalizeMenuItemId(categoryId, frequency.title);

        return {
          badges: buildMenuBadges(itemId, frequency),
          id: itemId,
          metaLabel: buildMenuMetaLabel(frequency),
          title: frequency.title,
        };
      }),
      title: CATEGORY_TITLE_MAP[categoryId],
    };
  }).filter(section => section.items.length > 0);

export const buildCampusRecommendedMenus = ({
  menu,
  currentDate,
}: {
  currentDate: string;
  menu: WeeklyMenu;
}): CampusCafeteriaRecommendedMenuViewData[] =>
  CATEGORY_IDS.map(categoryId => {
    const menuItems = getCategoryMenuItems(menu, categoryId);
    const todayTitles = getMenuForDate(menuItems, currentDate)
      .map(title => title.trim())
      .filter(Boolean);
    const frequencies = buildMenuFrequencies(menuItems, currentDate);
    const selectedFrequency =
      frequencies.find(frequency => todayTitles.includes(frequency.title)) ??
      frequencies[0];

    if (!selectedFrequency) {
      return null;
    }

    return {
      categoryLabel: CATEGORY_TITLE_MAP[categoryId],
      id: normalizeMenuItemId(categoryId, selectedFrequency.title),
      likeCountLabel: '',
      priceLabel: selectedFrequency.servedToday
        ? '오늘 제공'
        : `이번 주 ${selectedFrequency.count}회 제공`,
      title: selectedFrequency.title,
    };
  }).filter(
    (
      item,
    ): item is CampusCafeteriaRecommendedMenuViewData => item !== null,
  );

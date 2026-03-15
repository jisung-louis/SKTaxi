// 날짜별 메뉴 타입 (YYYY-MM-DD 형식의 날짜를 키로 사용)
export type DailyMenu = { [date: string]: string[] };

// 메뉴 항목 타입 (날짜별 객체 형태만 사용)
export type MenuItems = DailyMenu;

export interface WeeklyMenu {
  id: string; // "2024-W42"
  weekStart: string; // "2024-10-20"
  weekEnd: string; // "2024-10-24"
  rollNoodles: MenuItems; // { [date: string]: string[] }
  theBab: MenuItems; // { [date: string]: string[] }
  fryRice: MenuItems; // { [date: string]: string[] }
  createdAt: Date;
  updatedAt: Date;
}

// 특정 날짜의 메뉴를 가져오는 헬퍼 함수
export const getMenuForDate = (
  menuItems: MenuItems,
  date: string
): string[] => {
  if (typeof menuItems === 'object' && menuItems !== null) {
    return menuItems[date] || [];
  }
  return [];
};

// 모든 날짜의 메뉴를 합쳐서 반환 (중복 제거)
export const getAllMenuItems = (menuItems: MenuItems): string[] => {
  if (typeof menuItems === 'object' && menuItems !== null) {
    const allItems = new Set<string>();
    Object.values(menuItems).forEach(items => {
      items.forEach(item => allItems.add(item));
    });
    return Array.from(allItems);
  }
  return [];
};

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: string[];
}

export const CAFETERIA_CATEGORIES: MenuCategory[] = [
  {
    id: 'rollNoodles',
    name: 'Roll & Noodles',
    icon: 'restaurant',
    color: '#FF6B6B',
    items: []
  },
  {
    id: 'theBab',
    name: 'The bab',
    icon: 'bowl-rice',
    color: '#4ECDC4',
    items: []
  },
  {
    id: 'fryRice',
    name: 'Fry & Rice',
    icon: 'fast-food',
    color: '#45B7D1',
    items: []
  }
];

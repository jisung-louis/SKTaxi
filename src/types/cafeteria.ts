// 날짜별 메뉴 타입 (YYYY-MM-DD 형식의 날짜를 키로 사용)
export type DailyMenu = { [date: string]: string[] };

// 하위 호환성을 위해 배열 또는 날짜별 객체 모두 지원
export type MenuItems = string[] | DailyMenu;

export interface WeeklyMenu {
  id: string; // "2024-W42"
  weekStart: string; // "2024-10-20"
  weekEnd: string; // "2024-10-24"
  rollNoodles: MenuItems; // string[] 또는 { [date: string]: string[] }
  theBab: MenuItems; // string[] 또는 { [date: string]: string[] }
  fryRice: MenuItems; // string[] 또는 { [date: string]: string[] }
  createdAt: Date;
  updatedAt: Date;
}

// 특정 날짜의 메뉴를 가져오는 헬퍼 함수 타입
export const getMenuForDate = (
  menuItems: MenuItems,
  date: string
): string[] => {
  // 배열 형태인 경우 (기존 데이터, 모든 날짜 동일)
  if (Array.isArray(menuItems)) {
    return menuItems;
  }
  // 날짜별 객체 형태인 경우
  if (typeof menuItems === 'object' && menuItems !== null) {
    return menuItems[date] || [];
  }
  return [];
};

// 모든 날짜의 메뉴를 합쳐서 반환 (중복 제거)
export const getAllMenuItems = (menuItems: MenuItems): string[] => {
  if (Array.isArray(menuItems)) {
    return menuItems;
  }
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

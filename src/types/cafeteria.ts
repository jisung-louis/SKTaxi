export interface WeeklyMenu {
  id: string; // "2024-W42"
  weekStart: string; // "2024-10-20"
  weekEnd: string; // "2024-10-24"
  rollNoodles: string[]; // 10개
  theBab: string[]; // 7개
  fryRice: string[]; // 16개
  createdAt: Date;
  updatedAt: Date;
}

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

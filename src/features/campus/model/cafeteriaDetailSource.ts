export type CafeteriaCategoryId = 'rollNoodles' | 'theBab' | 'fryRice';

export type CafeteriaMenuBadgeTone = 'brand' | 'blue';

export interface CafeteriaMenuBadgeSource {
  id: string;
  label: string;
  tone: CafeteriaMenuBadgeTone;
}

export interface CafeteriaMenuItemSource {
  id: string;
  title: string;
  price: number;
  positiveCount: number;
  secondaryCount: number;
  badges?: CafeteriaMenuBadgeSource[];
}

export interface CafeteriaCategorySource {
  id: CafeteriaCategoryId;
  title: string;
  items: CafeteriaMenuItemSource[];
}

export interface CafeteriaDetailSource {
  categories: CafeteriaCategorySource[];
}

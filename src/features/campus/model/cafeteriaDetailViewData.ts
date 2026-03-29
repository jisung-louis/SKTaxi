import type {CafeteriaCategoryId} from './cafeteriaDetailSource';

export interface CafeteriaMenuBadgeViewData {
  id: string;
  label: string;
}

export interface CafeteriaReactionChipViewData {
  countLabel: string;
  iconName: string;
  isSelected: boolean;
}

export interface CafeteriaMenuItemViewData {
  id: string;
  badges: CafeteriaMenuBadgeViewData[];
  negativeReaction: CafeteriaReactionChipViewData;
  primaryReaction: CafeteriaReactionChipViewData;
  title: string;
}

export interface CafeteriaCategorySectionViewData {
  id: CafeteriaCategoryId;
  items: CafeteriaMenuItemViewData[];
  title: string;
}

export interface CafeteriaDetailScreenViewData {
  categories: CafeteriaCategorySectionViewData[];
  title: string;
}

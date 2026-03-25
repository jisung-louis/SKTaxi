import type {CafeteriaCategoryId} from './cafeteriaDetailSource';

export interface CafeteriaMenuBadgeViewData {
  id: string;
  backgroundColor: string;
  label: string;
  textColor: string;
}

export interface CafeteriaReactionChipViewData {
  countLabel: string;
  iconName: string;
}

export interface CafeteriaMenuItemViewData {
  id: string;
  badges: CafeteriaMenuBadgeViewData[];
  negativeReaction: CafeteriaReactionChipViewData;
  priceLabel: string;
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

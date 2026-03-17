import type {MyPageMenuActionKey} from './myPageSource';

export interface MyPageProfileViewData {
  avatarLabel: string;
  displayName: string;
  editLabel: string;
  subtitle: string;
}

export interface MyPageStatViewData {
  id: string;
  label: string;
  valueLabel: string;
}

export interface MyPageMenuItemViewData {
  actionKey: MyPageMenuActionKey;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  id: string;
  label: string;
}

export interface MyPageMenuSectionViewData {
  id: string;
  items: MyPageMenuItemViewData[];
  title: string;
}

export interface MyPageScreenViewData {
  logoutLabel: string;
  profile: MyPageProfileViewData;
  sections: MyPageMenuSectionViewData[];
  stats: MyPageStatViewData[];
  withdrawLabel: string;
}

export type MyPageMenuActionKey =
  | 'profileEdit'
  | 'myPosts'
  | 'bookmarks'
  | 'taxiHistory'
  | 'notificationSettings'
  | 'accountManagement'
  | 'inquiries'
  | 'appSettings';

export type MyPageMenuTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'gray';

export interface MyPageProfileSource {
  displayName: string;
  subtitle: string;
  editLabel: string;
}

export interface MyPageStatSource {
  actionKey: Extract<MyPageMenuActionKey, 'myPosts' | 'bookmarks' | 'taxiHistory'>;
  id: string;
  label: string;
  value: number;
}

export interface MyPageMenuItemSource {
  actionKey: MyPageMenuActionKey;
  id: string;
  iconName: string;
  label: string;
  tone: MyPageMenuTone;
}

export interface MyPageMenuSectionSource {
  id: string;
  items: MyPageMenuItemSource[];
  title: string;
}

export interface MyPageSource {
  profile: MyPageProfileSource;
  sections: MyPageMenuSectionSource[];
  stats: MyPageStatSource[];
}

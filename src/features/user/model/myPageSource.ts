export type MyPageMenuActionKey =
  | 'profileEdit'
  | 'myPosts'
  | 'bookmarks'
  | 'taxiHistory'
  | 'notificationSettings'
  | 'accountManagement'
  | 'inquiries'
  | 'appSettings';

export type MyPageStatKey = Extract<
  MyPageMenuActionKey,
  'myPosts' | 'bookmarks' | 'taxiHistory'
>;

export interface MyPageProfileSource {
  displayName: string;
  subtitle: string;
}

export interface MyPageSource {
  profile: MyPageProfileSource;
  stats: Record<MyPageStatKey, number>;
}

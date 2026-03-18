import type {
  MyPageMenuActionKey,
  MyPageStatKey,
} from '../model/myPageSource';

export type MyPageMenuTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'gray';

export interface MyPageMenuItemConfig {
  actionKey: MyPageMenuActionKey;
  iconName: string;
  id: string;
  label: string;
  tone: MyPageMenuTone;
}

export interface MyPageMenuSectionConfig {
  id: string;
  items: MyPageMenuItemConfig[];
  title: string;
}

export interface MyPageStatConfig {
  actionKey: MyPageStatKey;
  id: string;
  label: string;
}

export const MY_PAGE_PROFILE_EDIT_LABEL = '프로필 수정';

export const MY_PAGE_MENU_SECTIONS: MyPageMenuSectionConfig[] = [
  {
    id: 'activity',
    title: '내 활동',
    items: [
      {
        actionKey: 'myPosts',
        iconName: 'document-text-outline',
        id: 'my-posts',
        label: '내가 쓴 글',
        tone: 'blue',
      },
      {
        actionKey: 'bookmarks',
        iconName: 'bookmark-outline',
        id: 'bookmarks',
        label: '북마크',
        tone: 'green',
      },
      {
        actionKey: 'taxiHistory',
        iconName: 'car-outline',
        id: 'taxi-history',
        label: '택시 이용 내역',
        tone: 'orange',
      },
    ],
  },
  {
    id: 'settings',
    title: '설정',
    items: [
      {
        actionKey: 'notificationSettings',
        iconName: 'notifications-outline',
        id: 'notification-settings',
        label: '알림 설정',
        tone: 'purple',
      },
      {
        actionKey: 'accountManagement',
        iconName: 'card-outline',
        id: 'account-management',
        label: '계좌 관리',
        tone: 'pink',
      },
      {
        actionKey: 'inquiries',
        iconName: 'headset-outline',
        id: 'inquiries',
        label: '문의하기',
        tone: 'blue',
      },
      {
        actionKey: 'appSettings',
        iconName: 'settings-outline',
        id: 'app-settings',
        label: '앱 설정',
        tone: 'gray',
      },
    ],
  },
];

export const MY_PAGE_STAT_CONFIGS: MyPageStatConfig[] = [
  {
    actionKey: 'myPosts',
    id: 'post-count',
    label: '작성한 글',
  },
  {
    actionKey: 'bookmarks',
    id: 'bookmark-count',
    label: '북마크',
  },
  {
    actionKey: 'taxiHistory',
    id: 'taxi-usage-count',
    label: '택시 이용',
  },
];

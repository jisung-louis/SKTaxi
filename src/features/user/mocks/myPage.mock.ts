import type {MyPageSource} from '../model/myPageSource';

export const myPageMockData: MyPageSource = {
  logoutLabel: '로그아웃',
  profile: {
    displayName: '김성결',
    editLabel: '프로필 수정',
    subtitle: '컴퓨터공학과 3학년',
  },
  sections: [
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
  ],
  stats: [
    {
      id: 'post-count',
      label: '작성한 글',
      value: 12,
    },
    {
      id: 'bookmark-count',
      label: '북마크',
      value: 8,
    },
    {
      id: 'taxi-usage-count',
      label: '택시 이용',
      value: 5,
    },
  ],
  withdrawLabel: '회원탈퇴',
};

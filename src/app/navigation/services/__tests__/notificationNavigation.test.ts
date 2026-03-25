jest.mock('@/features/board', () => ({
  navigateToBoardDetail: jest.fn(),
}));

jest.mock('@/features/notice', () => ({
  navigateToNoticeDetail: jest.fn(),
}));

jest.mock('@/features/settings', () => ({
  navigateToAppNoticeDetail: jest.fn(),
}));

import {
  handlePushNotificationNavigation,
  handleStoredNotificationNavigation,
} from '../notificationNavigation';

describe('notificationNavigation', () => {
  const createNavigation = () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    popToTop: jest.fn(),
  });

  it('push chat_message가 party chatRoomId를 주면 택시 채팅으로 이동한다', () => {
    const navigation = createNavigation();

    handlePushNotificationNavigation({
      navigation,
      data: {
        type: 'CHAT_MESSAGE',
        chatRoomId: 'party:party-1',
      },
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Main', {
      screen: 'TaxiTab',
      params: {
        screen: 'Chat',
        params: {partyId: 'party-1'},
      },
    });
  });

  it('push chat_message가 일반 chatRoomId를 주면 커뮤니티 채팅으로 이동한다', () => {
    const navigation = createNavigation();

    handlePushNotificationNavigation({
      navigation,
      data: {
        type: 'CHAT_MESSAGE',
        chatRoomId: 'room-1',
      },
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Main', {
      screen: 'CommunityTab',
      params: {
        screen: 'ChatDetail',
        params: {chatRoomId: 'room-1'},
      },
    });
  });

  it('stored chat_message도 chatRoomId 기준으로 택시 채팅을 연다', () => {
    const navigation = createNavigation();

    handleStoredNotificationNavigation({
      navigation,
      notification: {
        type: 'chat_message',
        data: {
          chatRoomId: 'party:party-9',
        },
      } as any,
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Main', {
      screen: 'TaxiTab',
      params: {
        screen: 'Chat',
        params: {partyId: 'party-9'},
      },
    });
  });
});

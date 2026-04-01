const mockSubscribeForegroundMessages = jest.fn();

jest.mock('@/shared/lib/firebase/messaging', () => ({
  getInitialNotificationMessage: jest.fn(),
  registerBackgroundMessageHandler: jest.fn(),
  subscribeForegroundMessages: (...args: unknown[]) =>
    mockSubscribeForegroundMessages(...args),
  subscribeNotificationOpenedApp: jest.fn(),
}));

jest.mock('@/app/navigation/services/appRouteNavigation', () => ({
  navigateToAppNoticeDetail: jest.fn(),
  navigateToBoardDetail: jest.fn(),
  navigateToCommunityChat: jest.fn(),
  navigateToNoticeDetail: jest.fn(),
  navigateToTaxiChat: jest.fn(),
  navigateToTaxiScreen: jest.fn(),
}));

jest.mock('@/features/campus/services/academicNavigationService', () => ({
  navigateToAcademicCalendarDetail: jest.fn(),
}));

import {initForegroundMessageHandler} from '../pushNotificationRuntime';

describe('pushNotificationRuntime', () => {
  beforeEach(() => {
    mockSubscribeForegroundMessages.mockReset();
  });

  it('foreground PARTY_JOIN_REQUEST는 배너와 택시 채팅 intent를 함께 전달한다', async () => {
    let listener:
      | ((remoteMessage: {
          data?: Record<string, unknown>;
          notification?: {body?: string; title?: string};
        }) => Promise<void>)
      | undefined;

    mockSubscribeForegroundMessages.mockImplementation(
      (
        nextListener: (remoteMessage: {
          data?: Record<string, unknown>;
          notification?: {body?: string; title?: string};
        }) => Promise<void>,
      ) => {
        listener = nextListener;
        return jest.fn();
      },
    );

    const onForegroundNotification = jest.fn();
    const onJoinRequestReceived = jest.fn();

    initForegroundMessageHandler({
      onForegroundNotification,
      onJoinRequestReceived,
    });

    await listener?.({
      data: {
        contractVersion: '1',
        partyId: 'party-1',
        requestId: 'request-1',
        type: 'PARTY_JOIN_REQUEST',
      },
      notification: {
        body: '채팅방에서 동승 요청을 확인해보세요.',
        title: '새 동승 요청이 도착했어요',
      },
    });

    expect(onJoinRequestReceived).toHaveBeenCalledWith({
      partyId: 'party-1',
      requestId: 'request-1',
      type: 'PARTY_JOIN_REQUEST',
    });
    expect(onForegroundNotification).toHaveBeenCalledWith({
      body: '채팅방에서 동승 요청을 확인해보세요.',
      intent: {
        kind: 'taxiChat',
        partyId: 'party-1',
      },
      title: '새 동승 요청이 도착했어요',
    });
  });
});

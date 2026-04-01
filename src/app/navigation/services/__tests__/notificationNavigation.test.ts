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

import {
  navigateToAcademicCalendarDetail,
} from '@/features/campus/services/academicNavigationService';
import {
  navigateToBoardDetail,
  navigateToCommunityChat,
  navigateToTaxiChat,
} from '@/app/navigation/services/appRouteNavigation';

import {
  handlePushNotificationNavigation,
  handleStoredNotificationNavigation,
} from '../notificationNavigation';

describe('notificationNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('push chat_message가 party chatRoomId를 주면 택시 채팅으로 이동한다', () => {
    handlePushNotificationNavigation({
      data: {
        contractVersion: '1',
        type: 'CHAT_MESSAGE',
        chatRoomId: 'party:party-1',
      },
    });

    expect(navigateToTaxiChat).toHaveBeenCalledWith('party-1');
  });

  it('push chat_message가 일반 chatRoomId를 주면 커뮤니티 채팅으로 이동한다', () => {
    handlePushNotificationNavigation({
      data: {
        contractVersion: '1',
        type: 'CHAT_MESSAGE',
        chatRoomId: 'room-1',
      },
    });

    expect(navigateToCommunityChat).toHaveBeenCalledWith('room-1');
  });

  it('stored comment_created는 게시글 상세와 댓글 포커스로 이동한다', () => {
    handleStoredNotificationNavigation({
      notification: {
        id: 'notification-1',
        type: 'COMMENT_CREATED',
        title: '댓글 알림',
        message: '새 댓글이 달렸어요.',
        data: {
          commentId: 'comment-1',
          postId: 'post-1',
        },
        isRead: false,
        createdAt: new Date('2026-04-01T09:00:00.000Z'),
      },
    });

    expect(navigateToBoardDetail).toHaveBeenCalledWith('post-1', {
      initialCommentId: 'comment-1',
    });
  });

  it('stored academic_schedule은 학사 일정 상세로 이동한다', () => {
    handleStoredNotificationNavigation({
      notification: {
        id: 'notification-2',
        type: 'ACADEMIC_SCHEDULE',
        title: '학사 일정',
        message: '새 학사 일정이 등록되었어요.',
        data: {
          academicScheduleId: 'schedule-1',
        },
        isRead: false,
        createdAt: new Date('2026-04-01T09:00:00.000Z'),
      },
    });

    expect(navigateToAcademicCalendarDetail).toHaveBeenCalledWith('schedule-1');
  });
});

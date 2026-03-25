import type {NotificationInboxSourceItem} from '../model/notificationCenterSource';

const buildCreatedAt = (offsetMinutes: number) => {
  return new Date(Date.now() - offsetMinutes * 60 * 1000);
};

export const NOTIFICATION_CENTER_MOCK: NotificationInboxSourceItem[] = [
  {
    iconName: 'chatbubble-outline',
    iconTone: 'green',
    timeLabel: '28분 전',
    contextLabel: '중간고사 성적 정정 신청 방법 아는 분?',
    notification: {
      id: 'notification-board-comment-1',
      type: 'board_post_comment',
      title: '내 게시물에 댓글이 달렸어요',
      message:
        '가을하늘님이 댓글을 남겼어요: "저도 같은 문제 겪었는데, 학과사무실에 문의했더니..."',
      data: {
        postId: 'mock-board-post-1',
      },
      isRead: false,
      createdAt: buildCreatedAt(28),
    },
  },
  {
    iconName: 'return-up-back-outline',
    iconTone: 'blue',
    timeLabel: '1시간 전',
    contextLabel: '도서관 열람실 자리 예약 꿀팁',
    notification: {
      id: 'notification-board-reply-1',
      type: 'board_comment_reply',
      title: '내 댓글에 답글이 달렸어요',
      message:
        '봄바람22님이 답글을 남겼어요: "정보 감사해요! 덕분에 해결했어요 ㅎㅎ"',
      data: {
        postId: 'mock-board-post-2',
      },
      isRead: false,
      createdAt: buildCreatedAt(60),
    },
  },
  {
    iconName: 'megaphone-outline',
    iconTone: 'orange',
    timeLabel: '17시간 전',
    notification: {
      id: 'notification-app-notice-1',
      type: 'app_notice',
      title: '앱 공지',
      message:
        '[공지] 스쿠리 v1.2.0 업데이트 안내 — 택시파티 채팅 기능이 추가되었어요!',
      data: {
        appNoticeId: 'app-notice-update-120',
      },
      isRead: false,
      createdAt: buildCreatedAt(17 * 60),
    },
  },
  {
    iconName: 'car-sport-outline',
    iconTone: 'yellow',
    timeLabel: '20시간 전',
    notification: {
      id: 'notification-party-accepted-1',
      type: 'party_join_accepted',
      title: '동승 요청이 수락되었어요',
      message:
        '파티장 민들레님이 회원님의 동승 요청을 수락했어요. 출발 10분 전에 다시 알려드릴게요.',
      data: {
        partyId: 'taxi-home-party-1',
      },
      isRead: false,
      createdAt: buildCreatedAt(20 * 60),
    },
  },
  {
    iconName: 'chatbubble-outline',
    iconTone: 'green',
    timeLabel: '1일 전',
    contextLabel: '장학금 신청 서류 준비 체크리스트',
    notification: {
      id: 'notification-board-comment-2',
      type: 'board_post_comment',
      title: '내 게시물에 댓글이 달렸어요',
      message:
        '달빛소나타님이 댓글을 남겼어요: "혹시 신청 마감일이 언제인지 아세요?"',
      data: {
        postId: 'mock-board-post-3',
      },
      isRead: true,
      createdAt: buildCreatedAt(24 * 60),
      readAt: buildCreatedAt(23 * 60),
    },
  },
  {
    iconName: 'return-up-back-outline',
    iconTone: 'blue',
    timeLabel: '1일 전',
    contextLabel: '오늘 학식 솔직 후기',
    notification: {
      id: 'notification-board-reply-2',
      type: 'board_comment_reply',
      title: '내 댓글에 답글이 달렸어요',
      message:
        '초록빛노을님이 답글을 남겼어요: "저도 같이 가도 될까요? ㅎㅎ"',
      data: {
        postId: 'mock-board-post-4',
      },
      isRead: true,
      createdAt: buildCreatedAt(24 * 60),
      readAt: buildCreatedAt(20 * 60),
    },
  },
  {
    iconName: 'shield-checkmark-outline',
    iconTone: 'purple',
    timeLabel: '3일 전',
    notification: {
      id: 'notification-login-alert-1',
      type: 'member_kicked',
      title: '로그인 알림',
      message:
        '새 기기에서 로그인이 감지되었어요. 본인이 아니라면 비밀번호를 변경해주세요.',
      data: {},
      isRead: true,
      createdAt: buildCreatedAt(72 * 60),
      readAt: buildCreatedAt(70 * 60),
    },
  },
  {
    iconName: 'car-sport-outline',
    iconTone: 'yellow',
    timeLabel: '3일 전',
    notification: {
      id: 'notification-party-arrived-1',
      type: 'party_arrived',
      title: '파티가 출발 10분 전이에요',
      message:
        '학교 정문 → 안양역 파티가 곧 출발해요. 늦지 않게 이동해주세요!',
      data: {
        partyId: 'taxi-home-party-1',
      },
      isRead: true,
      createdAt: buildCreatedAt(72 * 60),
      readAt: buildCreatedAt(68 * 60),
    },
  },
];

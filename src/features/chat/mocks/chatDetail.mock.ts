import type {ChatDetailSourceData} from '../model/chatDetailViewData';

const avatarLabel = (
  backgroundColor: string,
  label: string,
  textColor = '#111827',
) => ({
  backgroundColor,
  kind: 'label' as const,
  label,
  textColor,
});

const avatarIcon = (
  backgroundColor: string,
  iconName: string,
  iconColor: string,
) => ({
  backgroundColor,
  iconColor,
  iconName,
  kind: 'icon' as const,
});

const COMMUNITY_CHAT_DETAIL_ITEMS: ChatDetailSourceData[] = [
  {
    composerPlaceholder: '메시지를 입력하세요',
    id: 'chat-1',
    memberCount: 1247,
    notificationEnabled: true,
    roomType: 'university',
    title: '성결대학교 전체',
    messages: [
      {
        avatar: avatarLabel('#FDE68A', '김'),
        createdAt: '2024-03-20T11:00:00+09:00',
        id: 'chat-1-message-1',
        senderId: 'kim-minjun',
        senderName: '김민준',
        text: '오늘 학식 뭐예요?',
      },
      {
        avatar: avatarLabel('#FBCFE8', '이'),
        createdAt: '2024-03-20T11:00:00+09:00',
        id: 'chat-1-message-2',
        senderId: 'lee-seoyeon',
        senderName: '이서연',
        text: '돈까스랑 된장찌개요!',
      },
      {
        avatar: avatarLabel('#FBCFE8', '이'),
        createdAt: '2024-03-20T11:01:00+09:00',
        id: 'chat-1-message-3',
        senderId: 'lee-seoyeon',
        senderName: '이서연',
        text: '오늘 돈까스 진짜 맛있었어요 ㅎㅎ',
      },
      {
        createdAt: '2024-03-20T11:02:00+09:00',
        id: 'chat-1-message-4',
        senderId: 'current-user',
        senderName: '나',
        text: '오 진짜요? 저 오늘 못 먹었는데 ㅠㅠ',
      },
      {
        createdAt: '2024-03-20T11:02:00+09:00',
        id: 'chat-1-message-5',
        senderId: 'current-user',
        senderName: '나',
        text: '내일도 나오나요?',
      },
      {
        avatar: avatarIcon('#E5E7EB', 'person-outline', '#9CA3AF'),
        createdAt: '2024-03-20T11:05:00+09:00',
        id: 'chat-1-message-6',
        senderId: 'park-jihoon',
        senderName: '박지훈',
        text: '내일은 비빔밥이래요',
      },
      {
        avatar: avatarLabel('#FDE68A', '김'),
        createdAt: '2024-03-20T11:06:00+09:00',
        id: 'chat-1-message-7',
        senderId: 'kim-minjun',
        senderName: '김민준',
        text: '학식 앱에서 확인할 수 있어요!',
      },
      {
        avatar: avatarLabel('#BFDBFE', '최'),
        createdAt: '2024-03-20T12:10:00+09:00',
        id: 'chat-1-message-8',
        senderId: 'choi-yujin',
        senderName: '최유진',
        text: '오늘 도서관 몇 시까지 열어요?',
      },
      {
        avatar: avatarLabel('#FBCFE8', '이'),
        createdAt: '2024-03-20T12:11:00+09:00',
        id: 'chat-1-message-9',
        senderId: 'lee-seoyeon',
        senderName: '이서연',
        text: '평일은 밤 11시까지예요!',
      },
      {
        createdAt: '2024-03-20T12:12:00+09:00',
        id: 'chat-1-message-10',
        senderId: 'current-user',
        senderName: '나',
        text: '감사합니다 ㅎㅎ',
      },
      {
        avatar: avatarLabel('#FDE68A', '정'),
        createdAt: '2024-03-20T12:44:00+09:00',
        id: 'chat-1-message-11',
        senderId: 'jung-taehyun',
        senderName: '정태현',
        text: '오늘 봄 축제 공지 봤어요?\n라인업 기대된다',
      },
      {
        avatar: avatarLabel('#BFDBFE', '최'),
        createdAt: '2024-03-20T12:45:00+09:00',
        id: 'chat-1-message-12',
        senderId: 'choi-yujin',
        senderName: '최유진',
        text: '저도요!! 빨리 공개됐으면 좋겠어요',
      },
    ],
  },
  {
    composerPlaceholder: '메시지를 입력하세요',
    id: 'chat-2',
    memberCount: 156,
    notificationEnabled: true,
    roomType: 'department',
    title: '컴퓨터공학과',
    messages: [
      {
        avatar: avatarLabel('#FDE68A', '김'),
        createdAt: '2024-03-20T09:00:00+09:00',
        id: 'chat-2-message-1',
        senderId: 'kim-minjun',
        senderName: '김민준',
        text: '교수님 오늘 수업 있어요?',
      },
      {
        avatar: avatarLabel('#FBCFE8', '이'),
        createdAt: '2024-03-20T09:01:00+09:00',
        id: 'chat-2-message-2',
        senderId: 'lee-seoyeon',
        senderName: '이서연',
        text: '네 있어요! 3시에 강의실 변경됐대요',
      },
      {
        createdAt: '2024-03-20T09:03:00+09:00',
        id: 'chat-2-message-3',
        senderId: 'current-user',
        senderName: '나',
        text: '어디로 바뀌었어요?',
      },
      {
        avatar: avatarLabel('#FBCFE8', '이'),
        createdAt: '2024-03-20T09:04:00+09:00',
        id: 'chat-2-message-4',
        senderId: 'lee-seoyeon',
        senderName: '이서연',
        text: '공학관 302호로 바뀌었어요',
      },
      {
        avatar: avatarIcon('#E5E7EB', 'person-outline', '#9CA3AF'),
        createdAt: '2024-03-20T11:28:00+09:00',
        id: 'chat-2-message-5',
        senderId: 'park-jihoon',
        senderName: '박지훈',
        text: '과제 언제까지예요?',
      },
      {
        avatar: avatarLabel('#FDE68A', '김'),
        createdAt: '2024-03-20T11:30:00+09:00',
        id: 'chat-2-message-6',
        senderId: 'kim-minjun',
        senderName: '김민준',
        text: '이번 주 금요일 자정까지요!',
      },
    ],
  },
  {
    composerPlaceholder: '메시지를 입력하세요',
    id: 'chat-3',
    memberCount: 203,
    notificationEnabled: false,
    roomType: 'department',
    title: '경영학과',
    messages: [
      {
        avatar: avatarLabel('#FDE68A', '박'),
        createdAt: '2024-03-19T18:00:00+09:00',
        id: 'chat-3-message-1',
        senderId: 'park-sumin',
        senderName: '박수민',
        text: '다음주 시험 범위 아시는 분?',
      },
      {
        createdAt: '2024-03-19T18:02:00+09:00',
        id: 'chat-3-message-2',
        senderId: 'current-user',
        senderName: '나',
        text: '공지 올라오면 공유할게요!',
      },
    ],
  },
  {
    composerPlaceholder: '메시지를 입력하세요',
    id: 'chat-4',
    memberCount: 8,
    notificationEnabled: true,
    roomType: 'custom',
    title: '스터디 모임',
    messages: [
      {
        avatar: avatarLabel('#DDD6FE', '스'),
        createdAt: '2024-03-18T21:00:00+09:00',
        id: 'chat-4-message-1',
        senderId: 'study-group',
        senderName: '스터디 모임',
        text: '내일 몇 시에 만날까요?',
      },
    ],
  },
];

export const COMMUNITY_CHAT_DETAIL_SOURCE_MOCK = COMMUNITY_CHAT_DETAIL_ITEMS.reduce<
  Record<string, ChatDetailSourceData>
>((accumulator, item) => {
  accumulator[item.id] = item;
  return accumulator;
}, {});

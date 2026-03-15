import {
  CHAT_DETAIL_CURRENT_USER_ID,
  CHAT_DETAIL_CURRENT_USER_NAME,
  type ChatDetailSourceData,
} from '../../model/chatDetailViewData';
import {COMMUNITY_CHAT_DETAIL_SOURCE_MOCK} from '../../mocks/chatDetail.mock';
import type {IChatDetailRepository} from './IChatDetailRepository';

const NETWORK_DELAY_MS = 180;

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
};

const cloneRoomDetail = (roomDetail: ChatDetailSourceData): ChatDetailSourceData => ({
  ...roomDetail,
  messages: roomDetail.messages.map(message => ({
    ...message,
    avatar: message.avatar ? {...message.avatar} : undefined,
  })),
});

const buildFallbackRoomDetail = (chatRoomId: string): ChatDetailSourceData => ({
  composerPlaceholder: '메시지를 입력하세요',
  id: chatRoomId,
  memberCount: 42,
  notificationEnabled: true,
  roomType: 'custom',
  title: '채팅방',
  messages: [
    {
      createdAt: '2024-03-20T10:00:00+09:00',
      id: `${chatRoomId}-fallback-message`,
      senderId: 'system-guide',
      senderName: '안내',
      text: '임시 mock 채팅방입니다. 새 메시지를 입력해서 흐름을 확인해보세요.',
      type: 'system',
    },
  ],
});

export class MockChatDetailRepository implements IChatDetailRepository {
  private readonly roomDetailById = new Map(
    Object.entries(COMMUNITY_CHAT_DETAIL_SOURCE_MOCK).map(([roomId, roomDetail]) => [
      roomId,
      cloneRoomDetail(roomDetail),
    ]),
  );

  async getRoomDetail(chatRoomId: string): Promise<ChatDetailSourceData | null> {
    await wait();

    const existingRoomDetail = this.roomDetailById.get(chatRoomId);

    if (existingRoomDetail) {
      return cloneRoomDetail(existingRoomDetail);
    }

    const fallbackRoomDetail = buildFallbackRoomDetail(chatRoomId);
    this.roomDetailById.set(chatRoomId, fallbackRoomDetail);
    return cloneRoomDetail(fallbackRoomDetail);
  }

  async sendMessage(
    chatRoomId: string,
    messageText: string,
  ): Promise<ChatDetailSourceData | null> {
    await wait();

    const roomDetail =
      this.roomDetailById.get(chatRoomId) ?? buildFallbackRoomDetail(chatRoomId);

    if (!this.roomDetailById.has(chatRoomId)) {
      this.roomDetailById.set(chatRoomId, roomDetail);
    }

    roomDetail.messages.push({
      createdAt: new Date().toISOString(),
      id: `${chatRoomId}-message-${Date.now()}`,
      senderId: CHAT_DETAIL_CURRENT_USER_ID,
      senderName: CHAT_DETAIL_CURRENT_USER_NAME,
      text: messageText,
    });

    return cloneRoomDetail(roomDetail);
  }

  async updateNotificationSetting(
    chatRoomId: string,
    enabled: boolean,
  ): Promise<ChatDetailSourceData | null> {
    await wait();

    const roomDetail =
      this.roomDetailById.get(chatRoomId) ?? buildFallbackRoomDetail(chatRoomId);

    if (!this.roomDetailById.has(chatRoomId)) {
      this.roomDetailById.set(chatRoomId, roomDetail);
    }

    roomDetail.notificationEnabled = enabled;
    return cloneRoomDetail(roomDetail);
  }
}

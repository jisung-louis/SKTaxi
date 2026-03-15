import type {ChatDetailSourceData} from '../../model/chatDetailViewData';

export interface IChatDetailRepository {
  getRoomDetail(chatRoomId: string): Promise<ChatDetailSourceData | null>
  sendMessage(
    chatRoomId: string,
    messageText: string,
  ): Promise<ChatDetailSourceData | null>
  updateNotificationSetting(
    chatRoomId: string,
    enabled: boolean,
  ): Promise<ChatDetailSourceData | null>
}

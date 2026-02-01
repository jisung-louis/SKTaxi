// SKTaxi: Chat 관련 훅 통합 내보내기

// === 채팅방 훅 (chatRooms 컬렉션) ===
export { useChatMessages } from './useChatMessages';
export type { UseChatMessagesResult } from './useChatMessages';

export { useChatActions } from './useChatActions';
export type { UseChatActionsResult } from './useChatActions';

export { useChatRoomStates } from './useChatRoomStates';
export type { UseChatRoomStatesResult } from './useChatRoomStates';

export { useChatRoomNotifications } from './useChatRoomNotifications';
export type { UseChatRoomNotificationsResult } from './useChatRoomNotifications';

export { useChatRoom, useChatRoomLastRead } from './useChatRoom';
export type { UseChatRoomResult, UseChatRoomLastReadResult } from './useChatRoom';

export { useChatRooms } from './useChatRooms';
export type { ChatRoomCategory } from './useChatRooms';

// === 파티 채팅 훅 (chats 컬렉션 - 택시 동승) ===
export { useMessages } from './useMessages';
export type { UseMessagesResult } from './useMessages';

// === 유틸리티 함수 re-export (utils/ 폴더에서) ===
// 파티 채팅 유틸리티
export {
  sendMessage,
  sendSystemMessage,
  sendAccountMessage,
  sendArrivedMessage,
  sendEndMessage,
} from '../../utils/partyMessageUtils';

// 채팅방 유틸리티
export {
  sendChatMessage,
  sendChatSystemMessage,
  joinChatRoom,
  getChatRoomNotificationSetting,
  updateChatRoomNotificationSetting,
} from '../../utils/chatUtils';

// 타입 re-export
export type { PartyMessage, AccountMessageData, ArrivalMessageData } from '../../repositories/interfaces/IPartyRepository';

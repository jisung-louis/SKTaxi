export type ChatRoomTypeDto =
  | 'UNIVERSITY'
  | 'DEPARTMENT'
  | 'GAME'
  | 'CUSTOM'
  | 'PARTY';

export type ChatMessageTypeDto =
  | 'TEXT'
  | 'IMAGE'
  | 'SYSTEM'
  | 'ACCOUNT'
  | 'ARRIVED'
  | 'END';

export interface ChatRoomDetailResponseDto {
  description?: string | null;
  id: string;
  isJoined: boolean;
  isMuted: boolean;
  isPublic: boolean;
  lastReadAt?: string | null;
  memberCount: number;
  name: string;
  type: ChatRoomTypeDto;
  unreadCount: number;
}

export interface ChatMessageResponseDto {
  accountData?: ChatAccountDataResponseDto | null;
  arrivalData?: ChatArrivalDataResponseDto | null;
  chatRoomId: string;
  createdAt: string;
  id: string;
  imageUrl?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  text?: string | null;
  type: ChatMessageTypeDto;
}

export interface ChatAccountDataResponseDto {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
}

export interface ChatArrivalDataResponseDto {
  memberCount?: number | null;
  perPerson?: number | null;
  taxiFare?: number | null;
}

export interface ChatMessageCursorResponseDto {
  createdAt: string;
  id: string;
}

export interface ChatMessagePageResponseDto {
  hasNext: boolean;
  messages: ChatMessageResponseDto[];
  nextCursor?: ChatMessageCursorResponseDto | null;
}

export interface ChatRoomSettingsResponseDto {
  chatRoomId: string;
  muted: boolean;
}

export interface ChatReadUpdateResponseDto {
  chatRoomId: string;
  lastReadAt: string;
  updated: boolean;
}

export interface SendChatMessageRequestDto {
  imageUrl?: string | null;
  taxiFare?: number | null;
  text?: string | null;
  type: Exclude<ChatMessageTypeDto, 'SYSTEM'>;
}

export interface StompApiErrorDto {
  errorCode?: string;
  message?: string;
  success?: boolean;
}

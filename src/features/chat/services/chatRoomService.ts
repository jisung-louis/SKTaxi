import type { IChatRepository } from '../data/repositories/IChatRepository';
import type {
  ChatRoom,
  ChatRoomNotificationPayload,
} from '../model/types';

export const formatTimeAgo = (timestamp: unknown) => {
  if (!timestamp) {
    return '';
  }

  try {
    const now = new Date();
    const createdAt =
      typeof (timestamp as any).toDate === 'function'
        ? (timestamp as any).toDate()
        : new Date(timestamp as string | number | Date);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    }

    if (diffHours > 0) {
      return `${diffHours}시간 전`;
    }

    if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    }

    return '방금 전';
  } catch {
    return '';
  }
};

export const getChatRoomIcon = (type: ChatRoom['type']) => {
  switch (type) {
    case 'university':
      return 'school-outline';
    case 'department':
      return 'people-outline';
    case 'game':
      return 'game-controller-outline';
    case 'custom':
      return 'chatbubbles-outline';
    default:
      return 'chatbubble-outline';
  }
};

export const getChatRoomDisplayName = (
  chatRoom: ChatRoom | null | undefined,
  department?: string | null,
) => {
  if (!chatRoom) {
    return '채팅방';
  }

  if (chatRoom.type === 'university') {
    return '성결대 전체 채팅방';
  }

  if (chatRoom.type === 'department' && department) {
    return `${department} 채팅방`;
  }

  return chatRoom.name || '채팅방';
};

export const buildChatRoomForegroundNotification = (
  chatRoom: ChatRoom | null | undefined,
  senderName: string,
  messageText: string,
  department?: string | null,
): Omit<ChatRoomNotificationPayload, 'chatRoomId'> => {
  return {
    title: getChatRoomDisplayName(chatRoom, department),
    body: `${senderName || '익명'} : ${messageText}`,
  };
};

export const resolveChatRoomForegroundNotification = async ({
  chatRepository,
  chatRoomId,
  department,
  messageText,
  senderName,
}: {
  chatRepository: IChatRepository;
  chatRoomId: string;
  department?: string | null;
  messageText: string;
  senderName: string;
}): Promise<ChatRoomNotificationPayload> => {
  const chatRoom = await chatRepository.getChatRoom(chatRoomId);

  return {
    ...buildChatRoomForegroundNotification(chatRoom, senderName, messageText, department),
    chatRoomId,
  };
};

export const sendChatTextMessage = async ({
  chatRepository,
  chatRoomId,
  text,
}: {
  chatRepository: IChatRepository;
  chatRoomId: string;
  text: string;
}) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('메시지를 입력해주세요.');
  }

  await chatRepository.sendMessage(chatRoomId, {
    text: trimmedText,
    type: 'text',
  });
};

export const sendChatImageMessage = async ({
  chatRepository,
  chatRoomId,
  imageUrl,
}: {
  chatRepository: IChatRepository;
  chatRoomId: string;
  imageUrl: string;
}) => {
  const trimmedImageUrl = imageUrl.trim();

  if (!trimmedImageUrl) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  await chatRepository.sendMessage(chatRoomId, {
    imageUrl: trimmedImageUrl,
    type: 'image',
  });
};

import { getAuth } from '@react-native-firebase/auth';

import { MockUserRepository } from '@/features/user/data/repositories/MockUserRepository';

import { sendChatSystemMessage, sendChatTextMessage } from '../../services/chatRoomService';
import { MockChatRepository } from '../repositories/MockChatRepository';

const chatRepository = new MockChatRepository();
const userRepository = new MockUserRepository();

const requireCurrentUser = () => {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  return user;
};

export const sendChatMessage = async (chatRoomId: string, text: string) => {
  const user = requireCurrentUser();
  const chatRoom = await chatRepository.getChatRoom(chatRoomId);

  await sendChatTextMessage({
    chatRepository,
    chatRoom,
    chatRoomId,
    text,
    userEmail: user.email,
    userId: user.uid,
    userRepository,
  });
};

export const sendChatSystemRuntimeMessage = async (chatRoomId: string, text: string) => {
  await sendChatSystemMessage({
    chatRepository,
    chatRoomId,
    text,
  });
};

export const joinChatRoom = async (chatRoomId: string, userId: string) => {
  await chatRepository.joinChatRoom(chatRoomId, userId);
};

export const getChatRoomNotificationSetting = async (chatRoomId: string, userId: string) => {
  return chatRepository.getNotificationSetting(chatRoomId, userId);
};

export const updateChatRoomNotificationSetting = async (
  chatRoomId: string,
  userId: string,
  enabled: boolean,
) => {
  await chatRepository.updateNotificationSetting(chatRoomId, userId, enabled);
};

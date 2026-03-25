import { getAuth } from '@react-native-firebase/auth';

import type { MinecraftServerInfo } from '../model/types';
import { minecraftRepository } from './composition/minecraftRuntime';
import { subscribeToMinecraftServerInfo as subscribeToRealtimeMinecraftServerInfo } from '../services/minecraftRealtimeService';

interface MinecraftServerInfoCallbacks {
  onData: (serverInfo: MinecraftServerInfo) => void;
  onError: (error: Error) => void;
}

export const subscribeToMinecraftServerInfo = ({
  onData,
  onError,
}: MinecraftServerInfoCallbacks) => {
  return subscribeToRealtimeMinecraftServerInfo({ onData, onError });
};

export const sendMinecraftChatMessage = async (chatRoomId: string, text: string) => {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('메시지를 입력해주세요.');
  }

  const senderName =
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    '스쿠리 유저';

  await minecraftRepository.sendMessage({
    chatRoomId,
    userId: user.uid,
    displayName: senderName,
    text: trimmedText,
  });
};

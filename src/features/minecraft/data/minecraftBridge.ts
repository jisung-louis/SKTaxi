import { getAuth } from '@react-native-firebase/auth';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';

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

  const profileSnapshot = await getDoc(doc(getFirestore(), 'users', user.uid));
  const profileData = profileSnapshot.data();
  const fallbackDisplayName = '스쿠리 유저';
  const senderName =
    typeof profileData?.displayName === 'string' && profileData.displayName.trim().length > 0
      ? profileData.displayName.trim()
      : fallbackDisplayName;

  await minecraftRepository.sendMessage({
    chatRoomId,
    userId: user.uid,
    displayName: senderName,
    text: trimmedText,
  });
};

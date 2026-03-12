import { getAuth } from '@react-native-firebase/auth';
import { getDatabase, onValue, push, ref } from '@react-native-firebase/database';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';

import type { MinecraftServerInfo } from '../model/types';

interface MinecraftServerInfoCallbacks {
  onData: (serverInfo: MinecraftServerInfo) => void;
  onError: (error: Error) => void;
}

const EMPTY_SERVER_INFO: MinecraftServerInfo = {
  currentPlayers: null,
  maxPlayers: null,
  online: null,
  serverUrl: null,
  version: null,
};

export const subscribeToMinecraftServerInfo = ({
  onData,
  onError,
}: MinecraftServerInfoCallbacks) => {
  const db = getDatabase();
  const statusRef = ref(db, 'serverStatus');
  const serverUrlRef = ref(db, 'serverStatus/serverUrl');
  const currentState: MinecraftServerInfo = { ...EMPTY_SERVER_INFO };

  const emit = () => {
    onData({ ...currentState });
  };

  const unsubscribeStatus = onValue(
    statusRef,
    snapshot => {
      const data = snapshot.val();

      if (!data) {
        Object.assign(currentState, EMPTY_SERVER_INFO);
        emit();
        return;
      }

      currentState.currentPlayers = data.currentPlayers ?? data.playerCount ?? 0;
      currentState.maxPlayers = data.maxPlayers ?? data.currentPlayers ?? 0;
      currentState.online = data.online ?? true;
      currentState.version = data.version ?? null;
      emit();
    },
    error => {
      Object.assign(currentState, EMPTY_SERVER_INFO);
      emit();
      onError(error as Error);
    },
  );

  const unsubscribeServerUrl = onValue(
    serverUrlRef,
    snapshot => {
      currentState.serverUrl = snapshot.exists() ? (snapshot.val() as string) : null;
      emit();
    },
    error => {
      currentState.serverUrl = null;
      emit();
      onError(error as Error);
    },
  );

  return () => {
    unsubscribeStatus();
    unsubscribeServerUrl();
  };
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

  await push(ref(getDatabase(), 'mc_chat/messages'), {
    username: senderName,
    message: trimmedText,
    timestamp: Date.now(),
    direction: 'app_to_mc',
    appUserId: user.uid,
    appUserDisplayName: senderName,
    chatRoomId,
  });
};

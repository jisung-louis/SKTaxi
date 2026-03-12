import { getDatabase, onValue, ref } from '@react-native-firebase/database';

import { sendMinecraftMessage as sendLegacyMinecraftMessage } from '@/lib/minecraftChat';

import type { ChatRoomServerInfo } from '../model/types';

interface ServerInfoCallbacks {
  onData: (serverInfo: ChatRoomServerInfo) => void;
  onError: (error: Error) => void;
}

const EMPTY_SERVER_INFO: ChatRoomServerInfo = {
  currentPlayers: null,
  maxPlayers: null,
  online: null,
  serverUrl: null,
  version: null,
};

export const subscribeToMinecraftServerInfo = ({ onData, onError }: ServerInfoCallbacks) => {
  const db = getDatabase();
  const statusRef = ref(db, 'serverStatus');
  const serverUrlRef = ref(db, 'serverStatus/serverUrl');
  const currentState: ChatRoomServerInfo = { ...EMPTY_SERVER_INFO };

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
  await sendLegacyMinecraftMessage(chatRoomId, text);
};

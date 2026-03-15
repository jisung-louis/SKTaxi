import {
  sendMinecraftChatMessage as sendMinecraftFeatureChatMessage,
  subscribeToMinecraftServerInfo as subscribeToMinecraftFeatureServerInfo,
} from '@/features/minecraft';

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
  return subscribeToMinecraftFeatureServerInfo({
    onData: serverInfo => {
      onData({
        ...EMPTY_SERVER_INFO,
        ...serverInfo,
      });
    },
    onError,
  });
};

export const sendMinecraftChatMessage = async (chatRoomId: string, text: string) => {
  await sendMinecraftFeatureChatMessage(chatRoomId, text);
};

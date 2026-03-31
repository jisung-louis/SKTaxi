import type { MinecraftServerInfo } from '../model/types';
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

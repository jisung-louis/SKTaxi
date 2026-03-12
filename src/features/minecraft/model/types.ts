export interface MinecraftServerInfo {
  currentPlayers: number | null;
  maxPlayers: number | null;
  online: boolean | null;
  serverUrl: string | null;
  version: string | null;
}

export type MinecraftEdition = 'JE' | 'BE';

export type MinecraftAccountEntry = {
  id: string;
  nickname: string; // 원본 닉네임 (공백 포함 가능)
  uuid: string; // Minotar 아바타 조회에 사용할 UUID 키
  normalizedKey?: string; // Spring 서버 기준 정규화 식별 키
  storedName?: string; // BE 전용: 공백을 _로 치환한 닉네임
  edition: MinecraftEdition;
  whoseFriend?: string; // 친구 계정인 경우, 부모 계정(첫 번째 계정)의 닉네임
  linkedAt: number;
  lastSeenAt?: number;
};

export type UserMinecraftAccount = {
  accounts: MinecraftAccountEntry[];
};

export type MinecraftWhitelistPlayer = {
  id: string;
  uuid: string;
  normalizedKey: string;
  username: string;
  edition?: MinecraftEdition;
  whoseFriend?: string; // 친구 계정인 경우, 부모 계정(첫 번째 계정)의 닉네임
  addedBy: string;
  addedAt?: number;
  lastSeenAt?: number; // 최근 접속 시각 (ms)
  online?: boolean;
};

export type MinecraftServerPlayer = {
  username: string;
  uuid?: string;
};

export type MinecraftServerStatus = {
  online?: boolean;
  maxPlayers?: number;
  currentPlayers?: number;
  players?: MinecraftServerPlayer[];
  updatedAt?: number;
};

export interface MinecraftServerInfo {
  currentPlayers: number | null;
  maxPlayers: number | null;
  online: boolean | null;
  serverUrl: string | null;
  version: string | null;
}

export interface MinecraftServerOverview {
  serverStatus: MinecraftServerStatus | null;
  serverUrl: string | null;
  mapUri: string | null;
  serverVersion: string | null;
}

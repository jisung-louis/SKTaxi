export type MinecraftEdition = 'JE' | 'BE';

export type MinecraftAccountEntry = {
  nickname: string; // 원본 닉네임 (공백 포함 가능)
  uuid: string; // JE: UUID, BE: "be:<storedName>" 또는 storedName
  storedName?: string; // BE 전용: 공백을 _로 치환한 닉네임
  edition: MinecraftEdition;
  whoseFriend?: string; // 친구 계정인 경우, 부모 계정(첫 번째 계정)의 닉네임
  linkedAt: number;
};

export type UserMinecraftAccount = {
  accounts: MinecraftAccountEntry[];
};

export type MinecraftWhitelistPlayer = {
  uuid: string;
  username: string;
  edition?: MinecraftEdition;
  whoseFriend?: string; // 친구 계정인 경우, 부모 계정(첫 번째 계정)의 닉네임
  addedBy: string;
  addedAt: number;
  lastSeenAt?: number; // 최근 접속 시각 (ms)
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


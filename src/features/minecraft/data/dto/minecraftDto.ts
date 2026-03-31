export type MinecraftEditionDto = 'JAVA' | 'BEDROCK';

export type MinecraftAccountRoleDto = 'SELF' | 'FRIEND';

export interface MinecraftOverviewResponseDto {
  chatRoomId: string;
  online: boolean | null;
  currentPlayers: number | null;
  maxPlayers: number | null;
  version: string | null;
  serverAddress: string | null;
  mapUrl: string | null;
  lastHeartbeatAt: string | null;
}

export interface MinecraftPlayerResponseDto {
  accountId: string;
  ownerMemberId: string;
  accountRole: MinecraftAccountRoleDto;
  edition: MinecraftEditionDto;
  gameName: string;
  normalizedKey: string;
  avatarUuid: string;
  parentGameName: string | null;
  online: boolean;
  lastSeenAt: string | null;
}

export interface MinecraftAccountResponseDto {
  id: string;
  accountRole: MinecraftAccountRoleDto;
  edition: MinecraftEditionDto;
  gameName: string;
  normalizedKey: string;
  avatarUuid: string;
  storedName: string | null;
  parentAccountId: string | null;
  parentGameName: string | null;
  lastSeenAt: string | null;
  linkedAt: string | null;
}

export interface CreateMinecraftAccountRequestDto {
  edition: MinecraftEditionDto;
  accountRole: MinecraftAccountRoleDto;
  gameName: string;
}

export interface MinecraftPlayersSnapshotResponseDto {
  players: MinecraftPlayerResponseDto[];
}

export interface MinecraftPlayerRemoveResponseDto {
  normalizedKey: string;
}

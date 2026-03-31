import type {
  DeleteAccountParams,
  RegisterAccountParams,
  RegisterAccountResult,
} from '../repositories/IMinecraftRepository';
import type {
  CreateMinecraftAccountRequestDto,
  MinecraftAccountResponseDto,
  MinecraftEditionDto,
  MinecraftOverviewResponseDto,
  MinecraftPlayerResponseDto,
} from '../dto/minecraftDto';
import type {
  MinecraftAccountEntry,
  MinecraftEdition,
  MinecraftServerInfo,
  MinecraftServerOverview,
  MinecraftWhitelistPlayer,
} from '../../model/types';

const DEFAULT_AVATAR_UUID = '8667ba71b85a4004af54457a9734eed7';

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const mapEditionDtoToModel = (edition: MinecraftEditionDto): MinecraftEdition =>
  edition === 'BEDROCK' ? 'BE' : 'JE';

const mapEditionModelToDto = (
  edition: MinecraftEdition,
): MinecraftEditionDto => (edition === 'BE' ? 'BEDROCK' : 'JAVA');

const resolveAvatarUuid = (avatarUuid?: string | null, normalizedKey?: string) =>
  avatarUuid || normalizedKey || DEFAULT_AVATAR_UUID;

export const mapRegisterParamsToCreateRequestDto = (
  params: RegisterAccountParams,
): CreateMinecraftAccountRequestDto => ({
  edition: mapEditionModelToDto(params.edition),
  accountRole: params.whoseFriend ? 'FRIEND' : 'SELF',
  gameName: params.nickname.trim(),
});

export const mapMinecraftAccountDtoToEntry = (
  dto: MinecraftAccountResponseDto,
): MinecraftAccountEntry => ({
  id: dto.id,
  nickname: dto.gameName,
  uuid: resolveAvatarUuid(dto.avatarUuid, dto.normalizedKey),
  normalizedKey: dto.normalizedKey,
  storedName: dto.storedName ?? undefined,
  edition: mapEditionDtoToModel(dto.edition),
  whoseFriend: dto.parentGameName ?? undefined,
  linkedAt: toTimestamp(dto.linkedAt) ?? Date.now(),
  lastSeenAt: toTimestamp(dto.lastSeenAt),
});

export const mapMinecraftAccountDtoToRegisterResult = (
  dto: MinecraftAccountResponseDto,
): RegisterAccountResult => ({
  id: dto.id,
  uuid: resolveAvatarUuid(dto.avatarUuid, dto.normalizedKey),
  nickname: dto.gameName,
  normalizedKey: dto.normalizedKey,
  storedName: dto.storedName ?? undefined,
  whoseFriend: dto.parentGameName ?? undefined,
});

export const mapMinecraftPlayerDtoToWhitelistPlayer = (
  dto: MinecraftPlayerResponseDto,
): MinecraftWhitelistPlayer => ({
  id: dto.accountId,
  uuid: resolveAvatarUuid(dto.avatarUuid, dto.normalizedKey),
  normalizedKey: dto.normalizedKey,
  username: dto.gameName,
  edition: mapEditionDtoToModel(dto.edition),
  whoseFriend: dto.parentGameName ?? undefined,
  addedBy: dto.ownerMemberId,
  lastSeenAt: toTimestamp(dto.lastSeenAt),
  online: dto.online,
});

export const mapMinecraftOverviewDtoToOverview = (
  dto: MinecraftOverviewResponseDto,
): MinecraftServerOverview => {
  const updatedAt = toTimestamp(dto.lastHeartbeatAt);
  const hasState =
    dto.online !== null ||
    dto.currentPlayers !== null ||
    dto.maxPlayers !== null ||
    dto.version !== null ||
    updatedAt !== undefined;

  return {
    serverStatus: hasState
      ? {
          online: dto.online ?? undefined,
          currentPlayers: dto.currentPlayers ?? undefined,
          maxPlayers: dto.maxPlayers ?? undefined,
          updatedAt,
        }
      : null,
    serverUrl: dto.serverAddress ?? null,
    mapUri: dto.mapUrl ?? null,
    serverVersion: dto.version ?? null,
  };
};

export const mapMinecraftOverviewToServerInfo = (
  overview: MinecraftServerOverview,
): MinecraftServerInfo => ({
  currentPlayers: overview.serverStatus?.currentPlayers ?? null,
  maxPlayers: overview.serverStatus?.maxPlayers ?? null,
  online: overview.serverStatus?.online ?? null,
  serverUrl: overview.serverUrl,
  version: overview.serverVersion,
});

export const matchesDeletedAccount = (
  account: MinecraftAccountEntry,
  params: DeleteAccountParams,
) => account.id === params.accountId;
